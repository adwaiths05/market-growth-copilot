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
    
    # 2. MCP Tool Calls
    pricing = await mcp_manager.call_tool("pricing_client.py", "get_competitor_prices", {"product_url": url})
    
    prompt = [
        SystemMessage(content="You are a Market Analyst. Extract a structured JSON of: 1. Average Price 2. Top Competitor 3. Key Selling Points."),
        HumanMessage(content=f"Research Context: {enriched_context}\nMCP Pricing Data: {pricing}")
    ]
    
    response = await llm_json.ainvoke(prompt)
    return {"analysis_result": json.loads(response.content), "status": "analyzed"}