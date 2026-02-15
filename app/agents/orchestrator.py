import asyncio
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import RetryPolicy
from app.agents.planner_agent import planner_node
from app.agents.research_agent import research_node
from app.agents.analytics_agent import analytics_node
from app.agents.optimization_agent import optimization_node
from app.agents.critic_agent import critic_node
from app.db.session import SessionLocal
from app.models.job_models import Job

memory = MemorySaver()

api_retry_policy = RetryPolicy(
    retry_on=Exception,
    max_attempts=3,
)

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
    Consolidates research, metrics, strategy, and critic reviews.
    """
    print(f"--- SAVER: Persisting data for Job {state['job_id']} ---")
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == state["job_id"]).first()
        if job:
            # FIX: Consolidate ALL agent outputs into the analysis_result JSON field
            job.analysis_result = {
                "plan": state.get("research_plan"),
                "raw_research": state.get("research_data"),
                "agent_analysis": state.get("analysis_result") # Includes metrics, growth_strategy, and critic_review
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
workflow.add_node("researcher", research_node, retry=api_retry_policy)
workflow.add_node("analytics", analytics_node, retry=api_retry_policy)
workflow.add_node("optimization", optimization_node, retry=api_retry_policy)
workflow.add_node("critic", critic_node)
workflow.add_node("saver", saver_node)

# 4. Define the Logic Sequence
workflow.set_entry_point("planner")

workflow.add_edge("planner", "researcher")
workflow.add_edge("researcher", "analytics")
workflow.add_edge("analytics", "optimization")
workflow.add_edge("optimization", "critic")
workflow.add_edge("critic", "saver")
workflow.add_edge("saver", END)

# Compile the workflow
app_workflow = workflow.compile(
    checkpointer=memory,
    interrupt_before=["saver"]
)