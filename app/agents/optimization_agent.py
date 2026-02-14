from langchain_mistralai import ChatMistralAI
from app.core.config import settings
from app.services.mcp_service import mcp_manager

llm = ChatMistralAI(model="mistral-small-latest", temperature=0.7, api_key=settings.MISTRAL_API_KEY)

async def optimization_node(state):
    print("--- OPTIMIZATION: Generating growth strategies ---")
    metrics = state.get("analysis_result", {}).get("metrics", "")
    job_id = str(state.get("job_id"))
    
    # Consult Internal MCP Tools
    inventory = await mcp_manager.call_tool("inventory_client.py", "get_stock_levels", {"product_id": job_id})
    catalog = await mcp_manager.call_tool("catalog_client.py", "get_product_economics", {"product_id": job_id})
    
    prompt = f"""
    Based on market metrics: {metrics}
    Internal Inventory: {inventory}
    Internal Economics: {catalog}
    
    Suggest 3 profitable strategies to increase sales for {state['product_url']}.
    """
    response = await llm.ainvoke(prompt)
    
    new_result = state["analysis_result"]
    new_result["growth_strategy"] = response.content
    
    return {"analysis_result": new_result, "status": "optimized"}