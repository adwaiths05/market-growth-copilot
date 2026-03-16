import time
from langchain_mistralai import ChatMistralAI
from app.core.config import settings
from app.schemas.agent_schemas import StrategyCritique
import asyncio
llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0,
    max_retries=5, 
    timeout=60,
    api_key=settings.MISTRAL_API_KEY
).with_structured_output(StrategyCritique, include_raw=True)

async def critic_node(state):
    """
    Critic Agent: Performs a structured audit of the proposed strategies.
    """
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    final_result = state.get("analysis_result")
    strategy = getattr(final_result, "growth_strategy", None)

    # If there is no growth strategy, skip critique gracefully
    if strategy is None:
        return {
            "analysis_result": final_result,
            "status": "skipped_no_strategy",
            "node_metrics": {
                "critic": {
                    "status": "skipped",
                    "reason": "No growth strategy available for critique",
                    "latency_sec": round(time.time() - start_time, 2),
                }
            },
        }
    
    prompt = (
        "Critically audit this growth strategy for data grounding and feasibility: "
        f"{strategy}"
    )
    
    try:
        await asyncio.sleep(1.5)
        result = await llm.ainvoke(prompt)
        telemetry = track_telemetry(result["raw"], "critic", start_time)

        if final_result is not None:
            final_result.critic_review = result["parsed"]

        return {
            "analysis_result": final_result,
            "status": "completed",
            "total_tokens": telemetry["tokens"],
            "total_cost": telemetry["cost"],
            "node_metrics": telemetry["metrics"],
        }
    except Exception as e:
        return {"status": "failed", "node_metrics": {"critic": {"error": str(e)}}}