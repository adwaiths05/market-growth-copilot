import asyncio
import time
import operator
from app.services import job_service
from typing import TypedDict, List, Optional, Annotated, Dict, Any
from langgraph.graph import StateGraph, END
from sqlalchemy.future import select
from app.db.session import AsyncSessionLocal, engine
from app.models.job_models import Job
from app.schemas.agent_schemas import AgentAnalysisOutput
from app.agents.planner_agent import planner_node
from app.agents.research_agent import research_node
from app.agents.analytics_agent import analytics_node
from app.agents.optimization_agent import optimization_node
from app.agents.critic_agent import critic_node
from langgraph.checkpoint.memory import MemorySaver
from app.services.stream_service import stream_manager 

def merge_dicts(a: dict, b: dict) -> dict:
    return {**a, **b}
def keep_latest(left, right):
    return right if right is not None else left
class AgentState(TypedDict):
    job_id: Annotated[str, keep_latest]
    product_url: Annotated[str, keep_latest]
    research_plan: Annotated[Optional[str], keep_latest]
    status: Annotated[str, keep_latest]
    analysis_result: Annotated[Optional[AgentAnalysisOutput], keep_latest]
    research_data: Annotated[List[str], operator.add]
    execution_timeline: Annotated[list, operator.add] 
    total_tokens: Annotated[int, operator.add]
    total_cost: Annotated[float, operator.add]
    node_metrics: Annotated[dict, merge_dicts]
    confidence_metrics: Annotated[dict, merge_dicts]
    cost_metrics: Annotated[dict, merge_dicts]

checkpoint_saver = MemorySaver()
INPUT_COST_PER_1M = 0.20  
OUTPUT_COST_PER_1M = 0.60

def track_telemetry(response: Any, node_name: str, start_time: float) -> Dict[str, Any]:
    """
    Calculates precise token usage, costs, and latency.
    """
    duration = time.time() - start_time
    
    usage = {}
    if hasattr(response, 'usage_metadata'):
        usage = response.usage_metadata
    elif hasattr(response, 'additional_kwargs'):
        usage = response.additional_kwargs.get('token_usage', {})

    prompt_tokens = usage.get('input_tokens', usage.get('prompt_tokens', 0))
    completion_tokens = usage.get('output_tokens', usage.get('completion_tokens', 0))
    total_tokens = prompt_tokens + completion_tokens
    
    cost = ((prompt_tokens / 1000000) * INPUT_COST_PER_1M) + \
           ((completion_tokens / 1000000) * OUTPUT_COST_PER_1M)
    
    return {
        "tokens": total_tokens,
        "cost": round(cost, 6),
        "metrics": {
            node_name: {
                "latency_sec": round(duration, 2),
                "tokens": total_tokens,
                "cost": round(cost, 6),
                "status": "success"
            }
        }
    }

async def streaming_finalizer_node(state: AgentState):
    """
    Final node that streams the result to the UI token-by-token.
    """
    job_id = state.get("job_id")
    final_analysis = state.get("analysis_result")
    
    # Broadcast that streaming has started
    await stream_manager.broadcast_status(job_id, {"status": "streaming_results"})

    if final_analysis and final_analysis.growth_strategy:
        # Simulate token streaming for the UI from the validated output
        content = str(final_analysis.growth_strategy.growth_strategies)
        words = content.split()
        
        for word in words:
            await stream_manager.broadcast_token(job_id, word + " ")
            # Optional: Small sleep for realistic typing effect
            await asyncio.sleep(0.02) 
            
    return state

async def broadcaster_node(state: AgentState):
    """
    Broadcasts status and periodically syncs state to the main jobs table.
    This prevents the 'Sync Issue' if a worker dies mid-stream.
    """
    job_id = state.get("job_id")
    current_status = state.get("status")
    
    # 1. Real-time UI Update via WebSocket
    status_update = {
        "job_id": job_id,
        "status": current_status,
        "latest_metrics": state.get("node_metrics", {}),
        "timestamp": time.time()
    }
    await stream_manager.broadcast_status(job_id, status_update)

    # 2. Sync to Postgres 'jobs' table for reliability
    # This ensures that even if the worker dies, the UI/API sees the latest node status.
    async with AsyncSessionLocal() as db:
        await job_service.update_job_status(
            db, 
            job_id, 
            status=current_status
        )
        
    return state

async def saver_node(state: AgentState):
    """Finalizes job in DB with structured results and observability data."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Job).filter(Job.id == state["job_id"]))
            job = result.scalars().first()
            if job:
                analysis_data = state.get("analysis_result")

                # Safely serialize the analysis data (Pydantic model or dict)
                if analysis_data:
                    if hasattr(analysis_data, "model_dump"):
                        serialized_analysis = analysis_data.model_dump()
                    else:
                        serialized_analysis = dict(analysis_data)
                else:
                    serialized_analysis = {}

                job.analysis_result = {
                    "plan": state.get("research_plan"),
                    "agent_analysis": serialized_analysis,
                }
                job.total_tokens = state.get("total_tokens", 0)
                job.total_cost = state.get("total_cost", 0.0)
                job.node_latency = state.get("node_metrics", {})
                job.status = "completed"
                await db.commit()
                
                await stream_manager.broadcast_status(state["job_id"], {"status": "completed"})
        except Exception as e:
            await db.rollback()
            raise e
    return state

# Graph Construction
workflow = StateGraph(AgentState)

# Add all nodes including the finalizer
workflow.add_node("planner", planner_node)
workflow.add_node("researcher", research_node)
workflow.add_node("analytics", analytics_node)
workflow.add_node("optimization", optimization_node)
workflow.add_node("critic", critic_node)
workflow.add_node("broadcaster", broadcaster_node)
workflow.add_node("finalizer", streaming_finalizer_node) # Node added
workflow.add_node("saver", saver_node)

workflow.set_entry_point("planner")

# Execution Flow
workflow.add_edge("planner", "broadcaster")
workflow.add_edge("broadcaster", "researcher")

workflow.add_edge("researcher", "broadcaster")
workflow.add_edge("broadcaster", "analytics")

workflow.add_edge("analytics", "broadcaster")
workflow.add_edge("broadcaster", "optimization")

workflow.add_edge("optimization", "broadcaster")
workflow.add_edge("broadcaster", "critic")

workflow.add_edge("critic", "broadcaster")
workflow.add_edge("broadcaster", "finalizer") # Added edge to finalizer
workflow.add_edge("finalizer", "saver")       # Finalizer leads to DB persistence

workflow.add_edge("saver", END)

app_workflow = workflow.compile(checkpointer=checkpoint_saver)