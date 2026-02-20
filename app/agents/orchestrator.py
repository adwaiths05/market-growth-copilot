import asyncio
import time
import operator
from typing import TypedDict, List, Optional, Annotated
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
from app.services.stream_service import stream_manager # Import the new stream service

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