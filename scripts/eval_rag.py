import asyncio
import uuid
from app.services.knowledge_service import kb_service
from app.db.session import SessionLocal
from app.models.vector_models import ProductEmbedding

async def run_rag_benchmark(job_id: str, gold_facts: list):
    """
    Automated RAG Evaluation Suite.
    Calculates Retrieval Precision and Recall for the marketplace context.
    """
    print(f"\n--- STARTING RAG EVALUATION: JOB {job_id} ---")
    
    total_score = 0
    for fact in gold_facts:
        query = fact["query"]
        expected_keyword = fact["expected_keyword"]
        
        # 1. Execute Retrieval
        retrieved_context = await kb_service.query_knowledge_base(job_id, query, top_k=3)
        
        # 2. Precision Scoring
        if expected_keyword.lower() in retrieved_context.lower():
            print(f"✅ PASS | Query: '{query}' | Found: '{expected_keyword}'")
            total_score += 1
        else:
            print(f"❌ FAIL | Query: '{query}' | Expected: '{expected_keyword}'")

    final_precision = (total_score / len(gold_facts)) * 100
    print(f"\n--- FINAL SCORE: {final_precision}% PRECISION ---")
    return final_precision

if __name__ == "__main__":
    test_job_id = "your-active-job-uuid" 
    benchmarks = [
        {"query": "What is the price?", "expected_keyword": "$"},
        {"query": "Who is the main competitor?", "expected_keyword": "Amazon"},
        {"query": "Is shipping free?", "expected_keyword": "shipping"}
    ]
    
    asyncio.run(run_rag_benchmark(test_job_id, benchmarks))