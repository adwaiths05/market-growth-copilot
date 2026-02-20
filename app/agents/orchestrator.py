import asyncio
import time
import operator
from typing import TypedDict, List, Optional, Annotated, Dict
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
from langgraph.checkpoint.postgres import PostgresSaver
from app.services.stream_service import stream_manager 
from app.services.stream_service import stream_manager

class AgentState(TypedDict):
    job_id: str
    product_url: str
    research_plan: Optional[str]
    research_data: Annotated[List[str], operator.add]
    analysis_result: Optional[AgentAnalysisOutput]
    total_tokens: Annotated[int, operator.add]
    total_cost: Annotated[float, operator.add]
    node_metrics: Annotated[dict, operator.merge]
    status: str

checkpoint_saver = PostgresSaver(engine)
INPUT_COST_PER_1K = 0.0002
OUTPUT_COST_PER_1K = 0.0006

def track_telemetry(response: Any, node_name: str, start_time: float) -> Dict[str, Any]:
    """
    Calculates token usage, costs, and latency for a specific node execution.
    """
    duration = time.time() - start_time
    
    # Extract token usage from LangChain/Mistral response
    # Handling cases where response might be structured output or standard AIMessage
    usage = getattr(response, 'usage_metadata', {}) if response else {}
    
    prompt_tokens = usage.get('input_tokens', 0)
    completion_tokens = usage.get('output_tokens', 0)
    total_tokens = prompt_tokens + completion_tokens
    
    # Calculate estimated cost
    cost = ((prompt_tokens / 1000) * INPUT_COST_PER_1K) + \
           ((completion_tokens / 1000) * OUTPUT_COST_PER_1K)
    
    return {
        "tokens": total_tokens,
        "cost": round(cost, 6),
        "metrics": {
            node_name: {
                "latency_sec": round(duration, 2),
                "tokens": total_tokens,
                "cost": round(cost, 6)
            }
        }
    }


async def streaming_finalizer_node(state):
    """
    Final node that streams the result to the UI token-by-token 
    before the saver persists it.
    """
    job_id = state.get("job_id")
    final_analysis = state.get("analysis_result")
    
    if final_analysis and final_analysis.growth_strategy:
        # Simulate token streaming for the UI
        # In a real setup, you'd hook this into the LLM's astream() method
        content = final_analysis.growth_strategy
        words = content.split()
        
        for word in words:
            await stream_manager.broadcast_token(job_id, word + " ")
            # Small sleep to simulate natural typing speed for the UI
            # await asyncio.sleep(0.05) 
            
    return state

async def broadcaster_node(state: AgentState):
    """
    Broadcasts the current state status and metrics to connected 
    WebSockets for real-time UI updates.
    """
    job_id = state.get("job_id")
    status_update = {
        "job_id": job_id,
        "status": state.get("status"),
        "latest_metrics": state.get("node_metrics", {}),
        "timestamp": time.time()
    }
    
    # Non-blocking broadcast to all frontend clients subscribed to this job_id
    await stream_manager.broadcast_status(job_id, status_update)
    return state

async def saver_node(state: AgentState):
    """Finalizes job in DB with structured results and observability data."""
    async with AsyncSessionLocal() as db:
        try:
            result = await db.execute(select(Job).filter(Job.id == state["job_id"]))
            job = result.scalars().first()
            if job:
                analysis_data = state.get("analysis_result")
                job.analysis_result = {
                    "plan": state.get("research_plan"),
                    "agent_analysis": analysis_data.model_dump() if analysis_data else {}
                }
                job.total_tokens = state.get("total_tokens", 0)
                job.total_cost = state.get("total_cost", 0.0)
                job.node_latency = state.get("node_metrics", {})
                job.status = "completed"
                await db.commit()
                
                # Final broadcast for completion
                await stream_manager.broadcast_status(state["job_id"], {"status": "completed"})
        except Exception as e:
            await db.rollback()
            raise e
    return state

# Graph Construction with Broadcaster Integration
workflow = StateGraph(AgentState)

workflow.add_node("planner", planner_node)
workflow.add_node("researcher", research_node)
workflow.add_node("analytics", analytics_node)
workflow.add_node("optimization", optimization_node)
workflow.add_node("critic", critic_node)
workflow.add_node("broadcaster", broadcaster_node) # Add the broadcaster node
workflow.add_node("saver", saver_node)

# Execution Flow: Every node routes through the broadcaster for real-time updates
workflow.set_entry_point("planner")

workflow.add_edge("planner", "broadcaster")
workflow.add_edge("broadcaster", "researcher")

workflow.add_edge("researcher", "broadcaster")
workflow.add_edge("broadcaster", "analytics")

workflow.add_edge("analytics", "broadcaster")
workflow.add_edge("broadcaster", "optimization")

workflow.add_edge("optimization", "broadcaster")
workflow.add_edge("broadcaster", "critic")

workflow.add_edge("critic", "broadcaster")
workflow.add_edge("broadcaster", "saver")

workflow.add_edge("saver", END)

app_workflow = workflow.compile(checkpointer=checkpoint_saver)