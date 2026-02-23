from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import and_, text
from app.models.job_models import Job
from uuid import UUID
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

async def create_job(db: AsyncSession, product_url: str) -> Job:
    """Initializes job with 30-minute idempotency check."""
    recent_threshold = datetime.utcnow() - timedelta(minutes=30)
    existing_job_query = await db.execute(
        select(Job).filter(
            and_(
                Job.product_url == product_url,
                Job.status.in_(["pending", "started"]),
                Job.created_at > recent_threshold
            )
        )
    )
    existing_job = existing_job_query.scalars().first()
    
    if existing_job:
        return existing_job

    job = Job(product_url=product_url, status="pending")
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job

async def update_job_status(db: AsyncSession, job_id: str, status: str, error: str = None):
    """Atomic status updates for worker reporting."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalars().first()
    if job:
        job.status = status
        if error:
            job.error_message = error
        await db.commit()

async def get_job(db: AsyncSession, job_id: UUID) -> Job:
    """Retrieves job metadata."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    return result.scalars().first()

async def is_job_resumable(db: AsyncSession, job_id: str) -> bool:
    """Checks if LangGraph checkpoints exist in Postgres."""
    query = text("SELECT 1 FROM checkpoints WHERE thread_id = :job_id LIMIT 1")
    result = await db.execute(query, {"job_id": job_id})
    exists = result.fetchone() is not None
    return exists

async def reset_job_for_retry(db: AsyncSession, job_id: str):
    """Prepares database for a worker retry."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    job = result.scalars().first()
    if job:
        job.status = "pending"
        job.error_message = None
        await db.commit()

async def get_latest_state(db: AsyncSession, job_id: str):
    """
    Retrieves the most recent status from the checkpoints to 
    sync the main 'jobs' table if a worker died silently.
    """
    query = text("""
        SELECT checkpoint FROM checkpoints 
        WHERE thread_id = :job_id 
        ORDER BY created_at DESC LIMIT 1
    """)
    result = await db.execute(query, {"job_id": job_id})
    row = result.fetchone()
    return row[0] if row else None