# app/agents/optimization_agent.py
from langchain_mistralai import ChatMistralAI
from app.core.config import settings
from app.services.mcp_service import mcp_manager
import logging

# Initialize logger for production tracking
logger = logging.getLogger(__name__)

llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0.7, 
    api_key=settings.MISTRAL_API_KEY
)

async def optimization_node(state):
    print("--- OPTIMIZATION: Generating growth strategies ---")
    
    # 1. Robust State Extraction
    # Safely access nested metrics with fallbacks to avoid NoneType errors
    analysis_result = state.get("analysis_result") or {}
    metrics = analysis_result.get("metrics") or analysis_result
    
    job_id = str(state.get("job_id"))
    product_url = state.get("product_url", "Unknown URL")
    
    # 2. Defensive MCP Tool Calls
    # Wrapped in try-except to prevent one tool failure from killing the whole agent
    try:
        inventory = await mcp_manager.call_tool(
            "inventory_client.py", 
            "get_stock_levels", 
            {"product_id": job_id}
        )
    except Exception as e:
        logger.error(f"Inventory tool failed: {e}")
        inventory = "Data unavailable"

    try:
        catalog = await mcp_manager.call_tool(
            "catalog_client.py", 
            "get_product_economics", 
            {"product_id": job_id}
        )
    except Exception as e:
        logger.error(f"Catalog tool failed: {e}")
        catalog = "Data unavailable"
    
    # 3. Structured Prompting
    prompt = f"""
    You are a Senior E-commerce Growth Consultant.
    
    Market Context (from Research): {metrics}
    Internal Inventory Status: {inventory}
    Product Economics (Margins/COGS): {catalog}
    
    Based on the data above, suggest 3 highly specific and profitable strategies 
    to increase sales and market share for the product at: {product_url}.
    
    Format your response with clear headings and data-backed justifications.
    """
    
    # 4. LLM Invocation
    response = await llm.ainvoke(prompt)
    
    # 5. Persistent State Update
    # We update the dictionary in place to preserve analytics data while adding strategies
    analysis_result["growth_strategy"] = response.content
    
    return {
        "analysis_result": analysis_result, 
        "status": "optimized"
    }