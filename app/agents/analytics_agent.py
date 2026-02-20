# app/agents/analytics_agent.py
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.services.knowledge_service import kb_service
from app.services.mcp_service import mcp_manager
from app.schemas.agent_schemas import AgentAnalysisOutput, AnalyticsMetrics
import logging

# Initialize logger for production observability
logger = logging.getLogger(__name__)

# Standard LLM instance for processing
llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0,
    api_key=settings.MISTRAL_API_KEY
)

async def analytics_node(state):
    print("--- ANALYTICS: Extracting key marketplace metrics ---")
    job_id = state.get("job_id")
    url = state.get("product_url")
    
    # 1. RAG Retrieval from persistent Knowledge Base
    enriched_context = await kb_service.query_knowledge_base(
        job_id=job_id, 
        query="Average price, top competitors, and key selling points"
    )
    
    # 2. Defensive MCP Tool Calls (Pricing + Reviews)
    try:
        pricing = await mcp_manager.call_tool("pricing_client.py", "get_competitor_prices", {"product_url": url})
        reviews = await mcp_manager.call_tool("review_client.py", "analyze_product_reviews", {"product_url": url})
    except Exception as e:
        logger.error(f"MCP Tool execution failed in Analytics: {e}")
        pricing, reviews = "Data unavailable", "Data unavailable"
    
    # 3. Structured Output Enforcement
    # This forces the LLM to return an instance of AnalyticsMetrics directly
    structured_llm = llm.with_structured_output(AnalyticsMetrics)
    
    prompt = [
        SystemMessage(content="""You are a Senior Market Analyst. 
        Your task is to extract highly accurate market metrics from the provided data.
        Ensure 'average_price' is a float and 'key_selling_points' is a concise list."""),
        HumanMessage(content=f"Research Context: {enriched_context}\nPricing Data: {pricing}\nReview Data: {reviews}")
    ]
    
    try:
        # The response here is a validated AnalyticsMetrics object
        metrics_response = await structured_llm.ainvoke(prompt)
        
        # 4. Wrap in the Agent Contract
        # We initialize the contract with the validated metrics
        analysis_result = AgentAnalysisOutput(
            metrics=metrics_response,
            confidence_score=0.95 # Hardened metadata for production logic
        )
        
        return {
            "analysis_result": analysis_result, 
            "status": "analyzed"
        }

    except Exception as e:
        logger.error(f"Structured output validation failed: {e}")
        # Fallback to a safe state to prevent graph execution failure
        return {
            "analysis_result": AgentAnalysisOutput(confidence_score=0.0),
            "status": "failed"
        }