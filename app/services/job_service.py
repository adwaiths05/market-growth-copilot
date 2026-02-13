from sqlalchemy.orm import Session
from app.models.job_models import Job
from app.db.session import SessionLocal
from uuid import UUID

def create_job(product_url: str):
    """Initializes a new analysis job in the database."""
    db = SessionLocal()
    try:
        job = Job(
            product_url=product_url,
            status="pending"
        )
        db.add(job)
        db.commit()
        db.refresh(job)
        return job
    finally:
        db.close()

def get_job(job_id: UUID):
    """Retrieves a specific job to check its status or results."""
    db = SessionLocal()
    try:
        return db.query(Job).filter(Job.id == job_id).first()
    finally:
        db.close()