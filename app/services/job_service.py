from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.job_models import Job
from uuid import UUID
from datetime import datetime

async def create_job(db: AsyncSession, product_url: str) -> Job:
    """Initializes a new analysis job asynchronously."""
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

async def get_job(db: AsyncSession, job_id: UUID) -> Job:
    """Retrieves a specific job for polling."""
    result = await db.execute(select(Job).filter(Job.id == job_id))
    return result.scalars().first()