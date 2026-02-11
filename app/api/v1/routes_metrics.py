from fastapi import APIRouter
from app.services.job_service import create_job
from app.schemas.job_schema import JobResponse

router = APIRouter()

@router.get("/ping")
def metrics_ping():
    return {"message": "metrics route working"}

@router.post("/", response_model=JobResponse)
def create_analysis_job():
    job = create_job()
    return {"job_id": job.id, "status": job.status}
