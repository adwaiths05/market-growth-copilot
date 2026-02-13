from pydantic import BaseModel, HttpUrl
from uuid import UUID
from typing import Optional, Any, Dict
from datetime import datetime

class JobCreate(BaseModel):
    product_url: str  # The input URL to analyze

class JobResponse(BaseModel):
    job_id: UUID
    product_url: str
    status: str
    analysis_result: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True # Allows SQLAlchemy models to be converted to Pydantic