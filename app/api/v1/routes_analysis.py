from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
import logging

from app.db.session import get_db
from app.services import job_service
from app.schemas.job_schema import JobCreate, JobResponse
from app.workers.celery_worker import run_agent_pipeline_task
from app.services.stream_service import stream_manager
from app.api.deps import get_current_user
from app.models.user_models import User
from jose import JWTError, jwt
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/analyze", response_model=JobResponse, status_code=202)
async def start_analysis(
    payload: JobCreate, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- LOCK APPLIED
):
    """Triggers background analysis. Requires valid JWT."""
    job = await job_service.create_job(db, product_url=payload.product_url)
    run_agent_pipeline_task.delay(str(job.id), job.product_url)
    return job

@router.get("/status/{job_id}", response_model=JobResponse)
async def get_analysis_status(
    job_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- LOCK APPLIED
):
    """Polling endpoint for UI status updates."""
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job

@router.post("/jobs/{job_id}/resume")
async def resume_analysis(
    job_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- LOCK APPLIED
):
    """Resumes interrupted workflow using persistent checkpoints."""
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    resumable = await job_service.is_job_resumable(db, str(job_id))
    await job_service.reset_job_for_retry(db, str(job_id))
    
    run_agent_pipeline_task.delay(str(job.id), job.product_url, resume=resumable)
    
    return {
        "job_id": str(job.id), 
        "status": "resumed", 
        "resumed_from_checkpoint": resumable
    }

@router.get("/jobs/{job_id}/result")
async def get_analysis_result(
    job_id: UUID, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user) # <-- LOCK APPLIED
):
    """Retrieves structured agent analysis."""
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status != "completed":
        return {
            "status": job.status, 
            "message": "Analysis in progress."
        }
        
    return {
        "job_id": str(job.id),
        "product_url": job.product_url,
        "results": job.analysis_result,
        "telemetry": {
            "total_tokens": job.total_tokens,
            "total_cost": job.total_cost,
            "latency_breakdown": job.node_latency
        }
    }

@router.websocket("/ws/{job_id}")
async def websocket_endpoint(
    websocket: WebSocket, 
    job_id: str, 
    token: str = Query(None) # WS auth relies on query params since browsers can't easily send headers in WS
):
    """
    Production WebSocket endpoint for real-time agent progress.
    Secured via token query parameter.
    """
    # Verify WebSocket Token
    if not token:
        await websocket.close(code=1008)
        return
    try:
        jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError:
        await websocket.close(code=1008)
        return

    # If valid, accept the connection
    await stream_manager.connect(job_id, websocket)
    try:
        while True:
            await websocket.receive_text() 
    except WebSocketDisconnect:
        stream_manager.disconnect(job_id, websocket)
        logger.info(f"Client disconnected from Job {job_id}")