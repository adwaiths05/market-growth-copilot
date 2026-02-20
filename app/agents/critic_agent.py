import time
from langchain_mistralai import ChatMistralAI
from app.core.config import settings

llm = ChatMistralAI(model="mistral-small-latest", temperature=0)

async def critic_node(state):
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    final_result = state.get("analysis_result")
    strategy = final_result.growth_strategy if final_result else ""
    
    prompt = f"Review this strategy for {state['product_url']}: {strategy}. Provide a final validation note."
    response = await llm.ainvoke(prompt)
    
    telemetry = track_telemetry(response, "critic", start_time)
    
    if final_result:
        final_result.critic_review = response.content
    
    return {
        "analysis_result": final_result, 
        "status": "completed",
        "total_tokens": telemetry["tokens"],
        "total_cost": telemetry["cost"],
        "node_metrics": telemetry["metrics"]
    }