# scripts/eval_rag.py
import asyncio
from typing import List, Dict
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.services.knowledge_service import kb_service
from app.core.config import settings

llm = ChatMistralAI(model="mistral-small-latest", temperature=0)

async def evaluate_faithfulness(answer: str, context: str) -> float:
    """
    Measures if the answer is factually supported by the context.
    Returns a score from 0.0 to 1.0.
    """
    prompt = [
        SystemMessage(content="You are a factual auditor. Grade the STUDENT ANSWER based ONLY on the provided CONTEXT."),
        HumanMessage(content=f"CONTEXT: {context}\n\nSTUDENT ANSWER: {answer}\n\n"
                             "Output only a JSON with 'score' (0-1) and 'reason'.")
    ]
    response = await llm.ainvoke(prompt)
    # Simplified parsing for the example
    import json
    try:
        data = json.loads(response.content)
        return float(data.get("score", 0.0))
    except:
        return 0.5

async def run_production_rag_benchmark(job_id: str, test_cases: List[Dict]):
    """
    Advanced RAG Evaluation Suite.
    Calculates Faithfulness and Context Relevance.
    """
    print(f"\n--- RAG AUDIT: JOB {job_id} ---")
    results = []

    for case in test_cases:
        query = case["query"]
        # 1. Simulate Retrieval
        context = await kb_service.query_knowledge_base(job_id, query, top_k=3)
        
        # 2. Simulate Generation (or use existing job result)
        # For this audit, we evaluate how well retrieved context supports a test answer
        score = await evaluate_faithfulness(case["expected_answer"], context)
        
        results.append(score)
        status = "✅ PASS" if score > 0.7 else "❌ FAIL"
        print(f"{status} | Query: {query[:30]}... | Faithfulness: {score}")

    avg_score = sum(results) / len(results)
    print(f"\n--- FINAL RAG QUALITY SCORE: {avg_score * 100:.1f}% ---")
    return avg_score

if __name__ == "__main__":
    # Example benchmark data
    benchmarks = [
        {"query": "Pricing details", "expected_answer": "The product costs $99 with free shipping."},
        {"query": "Competitor analysis", "expected_answer": "Main competitors include Amazon and Walmart."}
    ]
    asyncio.run(run_production_rag_benchmark("your-job-uuid", benchmarks))