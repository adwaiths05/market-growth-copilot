from fastapi import APIRouter
from app.services.job_service import create_job
from app.schemas.job_schema import JobResponse, JobCreate

router = APIRouter()

@router.get("/ping")
def metrics_ping():
    return {"message": "metrics route working"}

@router.post("/", response_model=JobResponse)
def create_analysis_job(payload: JobCreate):
    try:
        job = create_job(product_url=payload.product_url)
        return {
            "job_id": job.id, 
            "status": job.status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
