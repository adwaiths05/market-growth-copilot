# app/agents/orchestrator.py
import asyncio
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal # New Async Import
from app.models.job_models import Job
from app.agents.planner_agent import planner_node
from app.agents.research_agent import research_node
from app.agents.analytics_agent import analytics_node
from app.agents.optimization_agent import optimization_node
from app.agents.critic_agent import critic_node

memory = MemorySaver()

class AgentState(TypedDict):
    job_id: str
    product_url: str
    research_plan: Optional[str]
    research_data: Optional[List[str]]
    analysis_result: Optional[dict]
    status: str

async def saver_node(state: AgentState):
    """Asynchronously persists agent results to the database."""
    print(f"--- SAVER: Persisting data for Job {state['job_id']} ---")
    
    async with AsyncSessionLocal() as db:
        try:
            # Async query execution
            result = await db.execute(select(Job).filter(Job.id == state["job_id"]))
            job = result.scalars().first()
            
            if job:
                job.analysis_result = {
                    "plan": state.get("research_plan"),
                    "raw_research": state.get("research_data"),
                    "agent_analysis": state.get("analysis_result")
                }
                job.status = "completed"
                await db.commit()
                print("--- SAVER: Database updated successfully ---")
        except Exception as e:
            print(f"--- SAVER ERROR: {str(e)} ---")
            await db.rollback()
    return state

# Graph construction (unchanged)
workflow = StateGraph(AgentState)
workflow.add_node("planner", planner_node)
workflow.add_node("researcher", research_node)
workflow.add_node("analytics", analytics_node)
workflow.add_node("optimization", optimization_node)
workflow.add_node("critic", critic_node)
workflow.add_node("saver", saver_node)

workflow.set_entry_point("planner")
workflow.add_edge("planner", "researcher")
workflow.add_edge("researcher", "analytics")
workflow.add_edge("analytics", "optimization")
workflow.add_edge("optimization", "critic")
workflow.add_edge("critic", "saver")
workflow.add_edge("saver", END)

app_workflow = workflow.compile(checkpointer=memory)