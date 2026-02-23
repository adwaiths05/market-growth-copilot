import asyncio
import logging
from celery import Celery
from app.core.config import settings
from app.agents.orchestrator import app_workflow
from app.db.session import AsyncSessionLocal
from app.services import job_service

# Initialize logger for worker visibility
logger = logging.getLogger(__name__)

celery_app = Celery(
    "market_growth_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

# Production worker settings
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    worker_concurrency=settings.WORKER_CONCURRENCY,
    task_track_started=True,
    task_time_limit=3600, # 1 hour max execution
)

@celery_app.task(name="run_agent_pipeline_task", bind=True, max_retries=3)
def run_agent_pipeline_task(self, job_id: str, product_url: str, resume: bool = False):
    """
    Synchronous wrapper for the async agent pipeline.
    Uses a clean event loop per task execution to prevent loop-sharing issues.
    """
    try:
        loop = asyncio.get_event_loop()
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)

    return loop.run_until_complete(_execute_pipeline(job_id, product_url, resume))

async def _execute_pipeline(job_id: str, product_url: str, resume: bool):
    """
    Internal execution logic for the LangGraph workflow.
    Ensures thread-safe DB session management and state persistence.
    """
    logger.info(f"Starting pipeline for Job ID: {job_id} (Resume: {resume})")
    
    # thread_id is critical for LangGraph PostgresSaver to track state
    config = {"configurable": {"thread_id": job_id}}
    
    # If resuming, initial_state MUST be None so LangGraph loads from PostgresSaver
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
        # FIX: Removed the duplicate ainvoke call
        await app_workflow.ainvoke(initial_state, config=config)
        
    except Exception as e:
        logger.error(f"Pipeline failed for Job {job_id}: {str(e)}")
        async with AsyncSessionLocal() as db:
            await job_service.update_job_status(
                db, 
                job_id, 
                status="failed", 
                error=f"Worker Error: {str(e)}"
            )
        raise e