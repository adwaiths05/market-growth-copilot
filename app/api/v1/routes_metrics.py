from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from app.services.job_service import create_job, get_job
from app.schemas.job_schema import JobResponse, JobCreate
from app.agents.orchestrator import app_workflow
from uuid import UUID
from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter()

# app/api/v1/routes_metrics.py

async def run_agent_workflow(job_id: str, product_url: str):
    print(f"--- TRIGGERING AGENT FOR JOB {job_id} ---")
    try:
        # Define the configuration with the thread_id
        config = {"configurable": {"thread_id": job_id}} 
        
        await app_workflow.ainvoke(
            {"job_id": job_id, "product_url": product_url},
            config=config # Pass the config here!
        )
    except Exception as e:
        print(f"--- AGENT ERROR for Job {job_id}: {str(e)} ---")
        
@router.get("/ping")
def metrics_ping():
    return {"message": "metrics route working"}

@router.post("/", response_model=JobResponse)
async def start_analysis(payload: JobCreate, background_tasks: BackgroundTasks):
    """
    Primary endpoint to trigger marketplace analysis.
    """
    try:
        # 1. Initialize the database record
        job = create_job(product_url=payload.product_url)
        
        # 2. Schedule the LangGraph orchestration
        background_tasks.add_task(
            run_agent_workflow, 
            str(job.id), 
            job.product_url
        )
        
        # 3. Return the job object directly (Pydantic handles mapping via from_attributes)
        return job
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job Initialization Failed: {str(e)}")

@router.get("/{job_id}", response_model=JobResponse)
def check_job_status(job_id: UUID):
    """
    Returns the current status and results of an analysis job.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

@router.get("/{job_id}/telemetry")
async def get_job_telemetry(job_id: UUID, db: AsyncSession = Depends(get_db)):
    """
    Returns cost and performance metrics for a specific analysis job.
    Used for observability and client-side cost reporting.
    """
    job = await job_service.get_job(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    return {
        "job_id": str(job.id),
        "status": job.status,
        "financials": {
            "total_tokens": job.total_tokens,
            "total_cost_usd": job.total_cost,
            "currency": "USD"
        },
        "performance": {
            "node_latency_breakdown": job.node_latency,
            "created_at": job.created_at,
            "updated_at": job.updated_at
        }
    }
    
@router.post("/{job_id}/approve")
async def approve_analysis(job_id: UUID):
    try:
        # Use the job_id as the thread_id to resume the correct session
        config = {"configurable": {"thread_id": str(job_id)}}
        
        # Passing None signals the graph to resume from where it was interrupted
        await app_workflow.ainvoke(None, config=config)
        
        return {"message": "Analysis approved and saved to database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")