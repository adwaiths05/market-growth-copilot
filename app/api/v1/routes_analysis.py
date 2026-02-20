from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.session import get_db
from app.services import job_service
from app.schemas.job_schema import JobCreate, JobResponse
from app.workers.celery_worker import run_agent_pipeline_task

router = APIRouter()

@router.post("/analyze", response_model=JobResponse)
async def start_analysis(
    payload: JobCreate, 
    db: AsyncSession = Depends(get_db)
):
    """
    Initializes a marketplace analysis job and hands it off to a 
    distributed Celery worker.
    """
    # 1. Create job record in the database with status 'pending'
    job = await job_service.create_job(db, product_url=payload.product_url)
    
    # 2. Handoff to agent pipeline via Celery/Redis
    # .delay() sends the job to the queue and returns immediately, 
    # decoupling the long-running agent orchestration from the API request.
    run_agent_pipeline_task.delay(str(job.id), job.product_url)
    
    # 3. Return the job metadata immediately with a 202-style response pattern
    return job

@router.get("/status/{job_id}", response_model=JobResponse)
async def get_analysis_status(
    job_id: UUID, 
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the current status and results of a specific analysis job.
    """
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job