import asyncio
from celery import Celery
from app.core.config import settings
from app.agents.orchestrator import app_workflow
from app.db.session import AsyncSessionLocal
from app.services import job_service

celery_app = Celery(
    "market_growth_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

@celery_app.task(name="run_agent_pipeline_task")
def run_agent_pipeline_task(job_id: str, product_url: str, resume: bool = False):
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(_execute_pipeline(job_id, product_url))

async def _execute_pipeline(job_id: str, product_url: str, resume: bool):
    # The thread_id allows PostgresSaver to track this specific execution
    config = {"configurable": {"thread_id": job_id}}
    
    initial_state = None if resume else {
        "job_id": job_id,
        "product_url": product_url,
        "research_data": [],
        "total_tokens": 0,
        "total_cost": 0.0,
        "node_metrics": {},
        "status": "started"
    }
    
    try:
        # ainvoke will either start fresh with initial_state 
        # or resume based on thread_id in config
        await app_workflow.ainvoke(initial_state, config=config)
    except Exception as e:
        async with AsyncSessionLocal() as db:
            await job_service.update_job_status(db, job_id, status="failed", error=str(e))
        raise e