from sqlalchemy.orm import Session
from app.models.job_models import Job
from app.db.session import SessionLocal
from uuid import UUID
from datetime import datetime

def create_job(product_url: str) -> Job:
    """Initializes a new analysis job with validation."""
    db = SessionLocal()
    try:
        job = Job(
            product_url=product_url,
            status="pending",
            created_at=datetime.utcnow()
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    finally:
        db.close()

def update_job_status(job_id: str, status: str, error: str = None):
    """Updates the job status during the agent workflow."""
    db = SessionLocal()
    try:
        job = db.query(Job).filter(Job.id == job_id).first()
        if job:
            job.status = status
            if error:
                job.error_message = error
            db.commit()
    finally:
        db.close()

def get_job(job_id: UUID) -> Job:
    """Retrieves a specific job for polling."""
    db = SessionLocal()
    try:
        return db.query(Job).filter(Job.id == job_id).first()
    finally:
        db.close()