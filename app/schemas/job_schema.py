from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from typing import Optional, Any, Dict
from datetime import datetime

class JobCreate(BaseModel):
    product_url: str

class JobResponse(BaseModel):
    """
    Schema for the API response.
    Maps the internal database 'id' to the external 'job_id'.
    """
    # FIX: The field name must be 'id' to match the SQLAlchemy model 'Job.id'
    # The alias 'job_id' is what the user sees in the JSON response
    id: UUID = Field(..., alias="job_id")
    product_url: str
    status: str
    analysis_result: Optional[Dict[str, Any]] = Field(default_factory=dict)
    error_message: Optional[str] = None
    created_at: datetime

    # Pydantic V2 Configuration
    model_config = ConfigDict(
        from_attributes=True,   # Replaces orm_mode = True
        populate_by_name=True   # Allows the API to accept/return 'job_id'
    )