from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, or_, text
from app.models.job_models import Job
from uuid import UUID
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

async def create_job(db: AsyncSession, product_url: str) -> Job:
    """
    Initializes a new analysis job with Idempotency.
    If an active job for this URL exists (created in last 30 mins), returns that instead.
    """
    # 1. Idempotency Check: Look for existing active jobs for this URL
    # Prevents duplicate processing if a user clicks 'Analyze' multiple times.
    recent_threshold = datetime.utcnow() - timedelta(minutes=30)
    existing_job_query = await db.execute(
        select(Job).filter(
            and_(
                Job.product_url == product_url,
                Job.status.in_(["pending", "started", "planning_completed"]),
                Job.created_at > recent_threshold
            )
        )
    )
    existing_job = existing_job_query.scalars().first()
    
    if existing_job:
        logger.info(f"Returning existing active job {existing_job.id} for URL: {product_url}")
        return existing_job

    # 2. Create new job if no active one found
    job = Job(
        product_url=product_url,
        status="pending",
        created_at=datetime.utcnow()
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job

async def update_job_status(db: AsyncSession, job_id: str, status: str, error: str = None):
    """Updates the job status during the agent workflow."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalars().first()
    if job:
        job.status = status
        if error:
            job.error_message = error
        await db.commit()
        logger.info(f"Job {job_id} updated to status: {status}")

async def get_job(db: AsyncSession, job_id: UUID) -> Job:
    """Retrieves a specific job for polling."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    return result.scalars().first()

async def cleanup_stale_jobs(db: AsyncSession, timeout_minutes: int = 60):
    """
    Production Hardening: Finds jobs stuck in 'started' or 'pending' 
    longer than the timeout and marks them as failed.
    """
    threshold = datetime.utcnow() - timedelta(minutes=timeout_minutes)
    stale_jobs_query = await db.execute(
        select(Job).filter(
            and_(
                Job.status.in_(["pending", "started"]),
                Job.created_at < threshold
            )
        )
    )
    stale_jobs = stale_jobs_query.scalars().all()
    
    for job in stale_jobs:
        job.status = "failed"
        job.error_message = "Job timed out: Worker failed to report completion."
        logger.warning(f"Cleaned up stale job: {job.id}")
    
    await db.commit()
    return len(stale_jobs)

async def is_job_resumable(db: AsyncSession, job_id: str) -> bool:
    """
    Checks if a job has persistent checkpoints in the LangGraph table.
    LangGraph's PostgresSaver typically writes to a 'checkpoints' table.
    """
    # Check if any checkpoint exists for this thread_id (job_id)
    query = text("SELECT 1 FROM checkpoints WHERE thread_id = :job_id LIMIT 1")
    result = await db.execute(query, {"job_id": job_id})
    return result.fetchone() is not None

async def reset_job_for_retry(db: AsyncSession, job_id: str):
    """Clears error messages and resets status to allow a retry."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalars().first()
    if job:
        job.status = "pending"
        job.error_message = None
        await db.commit()
