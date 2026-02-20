import asyncio
import time
from typing import TypedDict, List, Optional
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal
from app.models.job_models import Job
from app.agents.planner_agent import planner_node
from app.agents.research_agent import research_node
from app.agents.analytics_agent import analytics_node
from app.agents.optimization_agent import optimization_node
from app.agents.critic_agent import critic_node
from langgraph.checkpoint.postgres import PostgresSaver 
from app.db.session import engine

class AgentState(TypedDict):
    job_id: str
    product_url: str
    research_plan: Optional[str]
    research_data: Annotated[List[str], operator.add]
    analysis_result: Optional[AgentAnalysisOutput]
    status: str

checkpoint_saver = PostgresSaver(engine)

def track_telemetry(state: AgentState, response, node_name: str, start_time: float):
    """Calculates cost and latency for a specific node execution."""
    latency = time.time() - start_time
    
    # Mistral provides usage in the response metadata
    usage = response.response_metadata.get("token_usage", {})
    prompt_tokens = usage.get("prompt_tokens", 0)
    completion_tokens = usage.get("completion_tokens", 0)
    
    # Calculate approximate cost for mistral-small-latest
    # (Rates: $0.2 per 1M input, $0.6 per 1M output - verify current rates)
    cost = (prompt_tokens * 0.0000002) + (completion_tokens * 0.0000006)
    
    # This data should be merged into the state to be saved by the saver_node
    return {
        "latency": latency,
        "tokens": prompt_tokens + completion_tokens,
        "cost": cost
    }

async def saver_node(state: AgentState):
    """Asynchronously persists agent results to the primary Jobs table."""
    print(f"--- SAVER: Finalizing Job {state['job_id']} ---")
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Job).filter(Job.id == state["job_id"]))
            job = result.scalars().first()
            if job:
                analysis_data = state.get("analysis_result")
                serialized_result = analysis_data.model_dump() if analysis_data else {}
                job.analysis_result = {
                    "plan": state.get("research_plan"),
                    "raw_research": state.get("research_data"),
                    "agent_analysis": serialized_result
                }
                job.status = "completed"
                await db.commit()
        except Exception as e:
            await db.rollback()
            raise e
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

app_workflow = workflow.compile(checkpointer=checkpoint_saver)