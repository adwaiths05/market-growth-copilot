import time
import json
import redis.async_io as redis
from langchain_mistralai import ChatMistralAI
from tavily import TavilyClient
from app.core.config import settings

# Shared Redis Client
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

async def research_node(state):
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    url = state.get("product_url")
    # Separate keys for the raw search context and the final summary
    context_key = f"raw_search_context:{url}"
    summary_key = f"research_summary:{url}"
    
    # 1. Check for Cached Summary first (Fastest)
    cached_summary = await redis_client.get(summary_key)
    if cached_summary:
        return {
            "research_data": [cached_summary],
            "status": "research_completed",
            "node_metrics": {"researcher": {"latency_sec": round(time.time() - start_time, 2), "cache": "summary_hit"}}
        }

    # 2. Check for Cached Raw Search Context (Saves Tavily Credits)
    search_context = await redis_client.get(context_key)
    if not search_context:
        search_result = tavily.search(query=f"Current price and competitors for {url}", search_depth="basic")
        search_context = "\n".join([r['content'] for r in search_result.get('results', [])])
        # Cache raw context for 24 hours
        await redis_client.set(context_key, search_context, ex=86400)

    # 3. Generate Summary
    llm = ChatMistralAI(model="mistral-small-latest", api_key=settings.MISTRAL_API_KEY)
    response = await llm.ainvoke(f"Summarize this research: {search_context}")
    
    # Cache the final summary
    await redis_client.set(summary_key, response.content, ex=86400)
    
    telemetry = track_telemetry(response, "researcher", start_time)
    return {
        "research_data": [response.content],
        "status": "research_completed",
        "total_tokens": telemetry["tokens"],
        "total_cost": telemetry["cost"],
        "node_metrics": telemetry["metrics"]
    }