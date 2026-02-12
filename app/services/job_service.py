from app.models.job_models import Job
from app.db.session import SessionLocal

def create_job(product_url: str):
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