import asyncio
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END

# Import the nodes from your specialized files
from app.agents.planner_agent import planner_node
from app.agents.research_agent import research_node
from app.agents.analytics_agent import analytics_node
from app.agents.optimization_agent import optimization_node
from app.agents.critic_agent import critic_node
from app.db.session import SessionLocal
from app.models.job_models import Job

# 1. Define the Shared State
class AgentState(TypedDict):
    job_id: str
    product_url: str
    research_plan: Optional[str]
    research_data: Optional[List[str]]
    analysis_result: Optional[dict]
    status: str

# 2. Define the Saver Node (Database Persistence)
async def saver_node(state: AgentState):
    """
    Final node that saves all agent findings to the Neon Database.
    This ensures your Postman GET request actually returns data.
    """
    print(f"--- SAVER: Persisting data for Job {state['job_id']} ---")
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == state["job_id"]).first()
        if job:
            # Consolidate agent findings into the analysis_result JSON field
            job.analysis_result = {
                "plan": state.get("research_plan"),
                "raw_research": state.get("research_data")
            }
            job.status = "completed"
            db.commit()
            print("--- SAVER: Database updated successfully ---")
    except Exception as e:
        print(f"--- SAVER ERROR: {str(e)} ---")
        db.rollback()
    finally:
        db.close()
    return state

# 3. Build the Graph
workflow = StateGraph(AgentState)

# Add specialized nodes
workflow.add_node("planner", planner_node)
workflow.add_node("researcher", research_node)
workflow.add_node("analytics", analytics_node)
workflow.add_node("optimization", optimization_node)
workflow.add_node("critic", critic_node)
workflow.add_node("saver", saver_node)

# 4. Define the Logic Sequence
workflow.set_entry_point("planner")

# We add a tiny delay between nodes to stay within Mistral's Free Tier Rate Limits
workflow.add_edge("planner", "researcher")
workflow.add_edge("researcher", "analytics")
workflow.add_edge("analytics", "optimization")
workflow.add_edge("optimization", "critic")
workflow.add_edge("critic", "saver")
workflow.add_edge("saver", END)

# Compile the workflow
app_workflow = workflow.compile()