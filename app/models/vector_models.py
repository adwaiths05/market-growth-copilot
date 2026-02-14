import uuid
from sqlalchemy import Column, String, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pgvector.sqlalchemy import Vector
from app.db.base import Base

class ProductEmbedding(Base):
    """
    Stores vector representations of product descriptions/reviews.
    Used for competitor research and market positioning.
    """
    __tablename__ = "product_embeddings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    job_id = Column(UUID(as_uuid=True), ForeignKey("jobs.id"), nullable=False)
    
    # FIX: 1024 is the standard dimension for Mistral 'mistral-embed' model
    embedding = Column(Vector(1024)) 
    
    # Store the original text snippet and metadata for context
    content = Column(Text, nullable=False)
    payload_metadata = Column(JSONB, nullable=True)