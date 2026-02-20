# app/workers/celery_worker.py
import asyncio
from celery import Celery
from app.core.config import settings
from app.agents.orchestrator import app_workflow
from app.db.session import AsyncSessionLocal
from app.services import job_service

# Initialize Celery with Redis as the broker and backend
celery_app = Celery(
    "market_growth_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Production-grade Celery configurations
celery_app.conf.update(
    task_track_started=True,
    task_time_limit=600,  # 10-minute hard timeout for complex agent flows
    worker_concurrency=settings.WORKER_CONCURRENCY
)

@celery_app.task(name="run_agent_pipeline_task")
def run_agent_pipeline_task(job_id: str, product_url: str):
    """
    Synchronous entry point for Celery to run the asynchronous LangGraph pipeline.
    """
    # Create a new event loop for the worker thread to handle async agent nodes
    loop = asyncio.get_event_loop()
    return loop.run_until_complete(_execute_pipeline(job_id, product_url))

async def _execute_pipeline(job_id: str, product_url: str):
    """Internal async executor for the orchestrator."""
    initial_state = {
        "job_id": job_id,
        "product_url": product_url,
        "status": "started"
    }
    
    try:
        # Invoke the LangGraph workflow
        await app_workflow.ainvoke(initial_state)
    except Exception as e:
        # Critical: Ensure failure status is persisted if the worker encounters an error
        async with AsyncSessionLocal() as db:
            await job_service.update_job_status(
                db, 
                job_id, 
                status="failed", 
                error=str(e)
            )
        raise e