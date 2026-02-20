from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from app.db.session import get_db
from app.services import job_service
from app.schemas.job_schema import JobCreate, JobResponse
from app.workers.celery_worker import run_agent_pipeline_task
from app.services.stream_service import stream_manager
import logging

logger = logging.getLogger(__name__)

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

@router.get("/jobs/{job_id}/result")
async def get_analysis_result(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Finalized Result Endpoint: Retrieves structured agent analysis 
    and detailed performance/cost telemetry.
    """
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        return {
            "status": job.status, 
            "message": "Analysis in progress. Please use the status endpoint or WebSocket for updates."
        }
        
    return {
        "job_id": str(job.id),
        "product_url": job.product_url,
        "results": job.analysis_result,  # Contains the validated AgentAnalysisOutput
        "telemetry": {
            "total_tokens": job.total_tokens,
            "total_cost": job.total_cost,
            "latency_breakdown": job.node_latency  # Persisted by saver_node
        }
    }

@router.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    """
    Production WebSocket endpoint for real-time agent progress.
    Allows the frontend to subscribe to specific Job ID events.
    """
    await stream_manager.connect(job_id, websocket)
    try:
        while True:
            # Keep the connection alive; the broadcaster_node handles the pushing
            await websocket.receive_text() 
    except WebSocketDisconnect:
        stream_manager.disconnect(job_id, websocket)
        logger.info(f"Client disconnected from Job {job_id}")

@router.post("/jobs/{job_id}/resume")
async def resume_analysis(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Resumes a failed or interrupted job from its last checkpoint.
    """
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    # Check if there is actual state to resume from
    resumable = await job_service.is_job_resumable(db, str(job_id))
    
    # Reset job status in DB
    await job_service.reset_job_for_retry(db, str(job_id))
    
    # Trigger worker. If resumable is True, the worker will pick up state.
    run_agent_pipeline_task.delay(str(job.id), job.product_url, resume=resumable)
    
    return {"message": "Job resumed", "job_id": str(job.id), "resumed_from_checkpoint": resumable}