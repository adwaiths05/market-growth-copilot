from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.job_service import create_job, get_job
from app.schemas.job_schema import JobResponse, JobCreate
from app.agents.orchestrator import app_workflow
from uuid import UUID

router = APIRouter()

async def run_agent_workflow(job_id: str, product_url: str):
    """
    Helper function to execute the LangGraph workflow in the background.
    This ensures the API remains responsive while the LLM works.
    """
    print(f"--- TRIGGERING AGENT FOR JOB {job_id} ---")
    try:
        # We use ainvoke (async invoke) to properly handle the Mistral/LangGraph call
        await app_workflow.ainvoke({
            "job_id": job_id, 
            "product_url": product_url
        })
    except Exception as e:
        print(f"--- AGENT ERROR for Job {job_id}: {str(e)} ---")

@router.get("/ping")
def metrics_ping():
    return {"message": "metrics route working"}

@router.post("/", response_model=JobResponse)
async def start_analysis(payload: JobCreate, background_tasks: BackgroundTasks):
    """
    Primary endpoint to trigger marketplace analysis.
    1. Creates a record in Neon (Status: pending).
    2. Offloads the Agentic work to a background thread.
    3. Returns the Job ID immediately.
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
        
        # 3. Return initial state to user
        return {
            "job_id": job.id,
            "product_url": job.product_url,
            "status": job.status,
            "created_at": job.created_at
        }
    except Exception as e:
        # Senior Tip: Log the error properly in production
        raise HTTPException(status_code=500, detail=f"Job Initialization Failed: {str(e)}")

@router.get("/{job_id}", response_model=JobResponse)
def check_job_status(job_id: UUID):
    """
    Returns the current status and results of an analysis job.
    Users poll this endpoint to see when the status changes from 'pending' to 'completed'.
    """
    job = get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": job.id,
        "product_url": job.product_url,
        "status": job.status,
        "analysis_result": job.analysis_result,
        "error_message": job.error_message,
        "created_at": job.created_at
    }