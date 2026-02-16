# app/agents/analytics_agent.py
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.services.knowledge_service import kb_service
from app.services.mcp_service import mcp_manager
import json

llm_json = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0,
    api_key=settings.MISTRAL_API_KEY,
    model_kwargs={"response_format": {"type": "json_object"}}
)

async def analytics_node(state):
    print("--- ANALYTICS: Extracting key marketplace metrics ---")
    job_id = state.get("job_id")
    url = state.get("product_url")
    
    # 1. RAG Retrieval
    enriched_context = await kb_service.query_knowledge_base(
        job_id=job_id, 
        query="Average price, top competitors, and key selling points"
    )
    
    # 2. MCP Tool Calls (Pricing + Reviews)
    pricing = await mcp_manager.call_tool("pricing_client.py", "get_competitor_prices", {"product_url": url})
    reviews = await mcp_manager.call_tool("review_client.py", "analyze_product_reviews", {"product_url": url})
    
    prompt = [
        SystemMessage(content="""You are a Market Analyst. 
        Extract a structured JSON containing a 'metrics' object with: 
        1. average_price 
        2. top_competitor 
        3. key_selling_points
        4. customer_sentiment (summarize pros/cons)"""),
        HumanMessage(content=f"Research Context: {enriched_context}\nPricing Data: {pricing}\nReview Data: {reviews}")
    ]
    
    response = await llm_json.ainvoke(prompt)
    
    # Robust JSON extraction to handle potential LLM formatting issues
    content = response.content
    try:
        # Remove markdown code blocks if present
        content = re.sub(r"```json\s?|\s?```", "", content).strip()
        analysis_data = json.loads(content)
    except json.JSONDecodeError:
        print("--- ANALYTICS ERROR: Failed to parse LLM JSON ---")
        analysis_data = {"metrics": {}, "error": "Parsing failed"}
    
    return {
        "analysis_result": analysis_data, 
        "status": "analyzed"
    }