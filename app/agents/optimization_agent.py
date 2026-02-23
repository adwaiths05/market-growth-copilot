import time
from langchain_mistralai import ChatMistralAI
from app.core.config import settings
from app.schemas.agent_schemas import OptimizationOutput

llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0.7,
    api_key=settings.MISTRAL_API_KEY
).with_structured_output(OptimizationOutput, include_raw=True)

async def optimization_node(state):
    """
    Optimization Agent: Suggests 3 growth strategies based on analytics.
    """
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    current_result = state.get("analysis_result")
    metrics = current_result.metrics if current_result else "No metrics available"
    
    prompt = f"Based on these metrics: {metrics}, suggest 3 growth strategies for {state['product_url']}."
    
    try:
        result = await llm.ainvoke(prompt)
        telemetry = track_telemetry(result['raw'], "optimization", start_time)
        
        current_result.growth_strategy = result['parsed']
        return {
            "analysis_result": current_result,
            "status": "optimized",
            "total_tokens": telemetry["tokens"],
            "total_cost": telemetry["cost"],
            "node_metrics": telemetry["metrics"]
        }
    except Exception as e:
        return {"status": "failed", "node_metrics": {"optimization": {"error": str(e)}}}