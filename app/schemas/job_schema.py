from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class JobCreate(BaseModel):
    product_url: str

class JobResponse(BaseModel):
    job_id: UUID
    status: str
