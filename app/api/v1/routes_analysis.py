from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.session import get_db, AsyncSessionLocal
from app.services import job_service
from app.schemas.job_schema import JobCreate, JobResponse
from app.agents.orchestrator import app_workflow

router = APIRouter()

async def run_agent_pipeline(job_id: str, product_url: str):
    """Background task to run the LangGraph workflow."""
    initial_state = {
        "job_id": job_id,
        "product_url": product_url,
        "status": "started"
    }
    try:
        await app_workflow.ainvoke(initial_state)
    except Exception as e:
        # Use an independent session to update failure status
        async with AsyncSessionLocal() as db:
            await job_service.update_job_status(db, job_id, status="failed", error=str(e))

@router.post("/analyze", response_model=JobResponse)
async def start_analysis(
    payload: JobCreate, 
    background_tasks: BackgroundTasks, 
    db: AsyncSession = Depends(get_db)
):
    # 1. Create job asynchronously
    job = await job_service.create_job(db, product_url=payload.product_url)
    
    # 2. Handoff to agent pipeline in background
    background_tasks.add_task(run_agent_pipeline, str(job.id), job.product_url)
    
    return job

@router.get("/status/{job_id}", response_model=JobResponse)
async def get_analysis_status(job_id: UUID, db: AsyncSession = Depends(get_db)):
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job