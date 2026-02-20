import uuid
from sqlalchemy import Column, String, DateTime, Text, Float, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from datetime import datetime
from app.db.base import Base

class Job(Base):
    """
    Main job tracking table.
    Stores request state, marketplace metadata, and final recommendations.
    """
    __tablename__ = "jobs"

    total_tokens = Column(Integer, default=0)
    total_cost = Column(Float, default=0.0)
    node_latency = Column(JSONB, default=dict)

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_url = Column(String, nullable=False)
    
    # Status tracks the agentic pipeline: pending -> researching -> analyzing -> completed
    status = Column(String, default="pending", nullable=False)
    
    # Store dynamic agent outputs (competitor lists, pricing analysis, etc.)
    analysis_result = Column(JSONB, nullable=True)
    
    # Error logging for LLM/Tool failures
    error_message = Column(Text, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)