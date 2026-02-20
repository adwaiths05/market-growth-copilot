import time
import logging
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.services.knowledge_service import kb_service
from app.services.mcp_service import mcp_manager
from app.schemas.agent_schemas import AgentAnalysisOutput, AnalyticsMetrics

logger = logging.getLogger(__name__)

llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0,
    api_key=settings.MISTRAL_API_KEY
)

async def analytics_node(state):
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    job_id = state.get("job_id")
    url = state.get("product_url")
    
    # 1. RAG Retrieval
    enriched_context = await kb_service.query_knowledge_base(
        job_id=job_id, 
        query="Average price, top competitors, and key selling points"
    )
    
    # 2. Tool Calls
    try:
        pricing = await mcp_manager.call_tool("pricing_client.py", "get_competitor_prices", {"product_url": url})
        reviews = await mcp_manager.call_tool("review_client.py", "analyze_product_reviews", {"product_url": url})
    except Exception as e:
        pricing, reviews = "Data unavailable", "Data unavailable"
    
    # 3. Structured Output Enforcement
    structured_llm = llm.with_structured_output(AnalyticsMetrics)
    
    prompt = [
        SystemMessage(content="You are a Senior Market Analyst. Extract accurate metrics."),
        HumanMessage(content=f"Research: {enriched_context}\nPricing: {pricing}\nReviews: {reviews}")
    ]
    
    try:
        metrics_response = await structured_llm.ainvoke(prompt)
        telemetry = track_telemetry(metrics_response, "analytics", start_time)
        
        analysis_result = AgentAnalysisOutput(
            metrics=metrics_response,
            confidence_score=0.95
        )
        
        return {
            "analysis_result": analysis_result, 
            "status": "analyzed",
            "total_tokens": telemetry["tokens"],
            "total_cost": telemetry["cost"],
            "node_metrics": telemetry["metrics"]
        }
    except Exception as e:
        logger.error(f"Analytics validation failed: {e}")
        return {"status": "failed", "node_metrics": {"analytics": {"error": str(e)}}}