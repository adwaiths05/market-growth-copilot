import time
from langchain_mistralai import ChatMistralAI
from app.core.config import settings
from app.services.mcp_service import mcp_manager

llm = ChatMistralAI(model="mistral-small-latest", temperature=0.7)

async def optimization_node(state):
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    current_result = state.get("analysis_result")
    metrics = current_result.metrics if current_result else "No metrics available"
    
    # Defensive Tooling
    try:
        inventory = await mcp_manager.call_tool("inventory_client.py", "get_stock_levels", {"product_id": state["job_id"]})
    except:
        inventory = "Data unavailable"

    prompt = f"Context: {metrics}\nInventory: {inventory}\nSuggest 3 growth strategies for {state['product_url']}."
    response = await llm.ainvoke(prompt)
    
    # Update structured contract
    current_result.growth_strategy = response.content
    telemetry = track_telemetry(response, "optimization", start_time)
    
    return {
        "analysis_result": current_result,
        "status": "optimized",
        "total_tokens": telemetry["tokens"],
        "total_cost": telemetry["cost"],
        "node_metrics": telemetry["metrics"]
    }