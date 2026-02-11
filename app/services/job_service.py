from app.models.job_models import Job
from app.db.session import SessionLocal

def create_job():
    db = SessionLocal()
    job = Job(status="pending")
    db.add(job)
    db.commit()
    db.refresh(job)
    db.close()
    return job
