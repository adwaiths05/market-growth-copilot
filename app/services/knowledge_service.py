import uuid
from typing import List
from langchain_mistralai import MistralAIEmbeddings
from app.db.session import SessionLocal
from app.models.vector_models import ProductEmbedding
from app.core.config import settings
from sqlalchemy import func

class KnowledgeService:
    def __init__(self):
        # Initializing Mistral Embeddings (aligned with 1024 dimensions)
        self.embeddings = MistralAIEmbeddings(
            api_key=settings.MISTRAL_API_KEY,
            model="mistral-embed"
        )

    def chunk_text(self, text: str, chunk_size: int = 500) -> List[str]:
        """Simple character-based chunking for research data."""
        return [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]

    async def add_research_to_kb(self, job_id: str, raw_text: str):
        """Processes raw research data: chunks it, embeds it, and saves to pgvector."""
        db = SessionLocal()
        chunks = self.chunk_text(raw_text)
        try:
            for chunk in chunks:
                vector = await self.embeddings.aembed_query(chunk)
                embedding_entry = ProductEmbedding(
                    job_id=uuid.UUID(job_id),
                    embedding=vector,
                    content=chunk,
                    payload_metadata={"source": "tavily_research"}
                )
                db.add(embedding_entry)
            db.commit()
            print(f"--- KNOWLEDGE BASE: Processed {len(chunks)} chunks for Job {job_id} ---")
        except Exception as e:
            print(f"--- KB ERROR: {str(e)} ---")
            db.rollback()
        finally:
            db.close()

    

    async def query_knowledge_base(self, job_id: str, query: str, top_k: int = 5) -> str:
    db = SessionLocal()
    try:
        query_vector = await self.embeddings.aembed_query(query)
        
        # Hardened Retrieval with Distance Threshold
        # Only return chunks with a cosine distance less than 0.4 (high similarity)
        results = db.query(ProductEmbedding).filter(
            ProductEmbedding.job_id == uuid.UUID(job_id),
            ProductEmbedding.embedding.cosine_distance(query_vector) < 0.4 
        ).order_by(
            ProductEmbedding.embedding.cosine_distance(query_vector)
        ).limit(top_k).all()
        
        if not results:
            return "No highly relevant research data found."

        return "\n\n".join([r.content for r in results])
    finally:
        db.close()

    # app/services/knowledge_service.py (Add this method)
    async def get_raw_context_for_eval(self, job_id: str, query: str) -> str:
    """
    Retrieves the top-k document chunks specifically for quality auditing.
    """
    # This logic should match your vector search implementation
        results = await self.vector_store.similarity_search(query, k=3, filter={"job_id": job_id})
        return "\n".join([doc.page_content for doc in results])

# Export a singleton instance
kb_service = KnowledgeService()