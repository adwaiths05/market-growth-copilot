from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.services.job_service import create_job, get_job
from app.schemas.job_schema import JobResponse, JobCreate
from app.agents.orchestrator import app_workflow
from uuid import UUID

router = APIRouter()

async def run_agent_workflow(job_id: str, product_url: str):
    """
    Helper function to execute the LangGraph workflow in the background.
    """
    print(f"--- TRIGGERING AGENT FOR JOB {job_id} ---")
    try:
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

@router.post("/{job_id}/approve")
async def approve_analysis(job_id: UUID):
    """
    Resumes the LangGraph workflow after a human has reviewed the 
    draft analysis in the 'pending_review' state.
    """
    # This retrieves the paused state and resumes it until the 'saver' node completes
    try:
        # We pass None as the input because we are just signaling 'resume'
        await app_workflow.ainvoke(None, config={"configurable": {"thread_id": str(job_id)}})
        return {"message": "Analysis approved and saved to database."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Approval failed: {str(e)}")