import time
import json
import redis.asyncio as redis
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
    context_key = f"raw_search_context:{url}"
    summary_key = f"research_summary:{url}"
    
    # Initialize real-data trackers
    evidence_count = 0
    tavily_cost = 0.0
    
    # 1. Check for Cached Summary first (Fastest)
    cached_summary = await redis_client.get(summary_key)
    if cached_summary:
        end_time = time.time()
        return {
            "research_data": [cached_summary],
            "status": "research_completed",
            "execution_timeline": [{
                "step": "Market Research (Cache Hit)",
                "start_time": round(start_time, 2),
                "end_time": round(end_time, 2),
                "duration_seconds": round(end_time - start_time, 2)
            }],
            "confidence_metrics": {"evidence_count": 0},
            "cost_metrics": {"tavily_cost": 0.0, "llm_cost": 0.0},
            "node_metrics": {"researcher": {"latency_sec": round(end_time - start_time, 2), "cache": "summary_hit"}}
        }

    # 2. Check for Cached Raw Search Context (Saves Tavily Credits)
    search_context = await redis_client.get(context_key)
    if not search_context:
        search_result = tavily.search(query=f"Current price and competitors for {url}", search_depth="basic")
        results_list = search_result.get('results', [])
        evidence_count = len(results_list)
        
        search_context = "\n".join([r['content'] for r in results_list])
        tavily_cost = 0.005 # Standard Tavily basic search cost
        
        # Cache raw context for 24 hours
        await redis_client.set(context_key, search_context, ex=86400)
    else:
        # Estimate evidence from cached text if bypassing search
        evidence_count = len(search_context.split('\n'))

    # 3. Generate Summary
    llm = ChatMistralAI(model="mistral-small-latest", api_key=settings.MISTRAL_API_KEY)
    response = await llm.ainvoke(f"Summarize this research: {search_context}")
    
    # Cache the final summary
    await redis_client.set(summary_key, response.content, ex=86400)
    
    telemetry = track_telemetry(response, "researcher", start_time)
    end_time = time.time()
    
    return {
        "research_data": [response.content],
        "status": "research_completed",
        "total_tokens": telemetry["tokens"],
        "total_cost": telemetry["cost"],
        "node_metrics": telemetry["metrics"],
        # --- REAL-DATA METRICS ---
        "execution_timeline": [{
            "step": "Market Research (Tavily + Mistral)",
            "start_time": round(start_time, 2),
            "end_time": round(end_time, 2),
            "duration_seconds": round(end_time - start_time, 2)
        }],
        "confidence_metrics": {
            "evidence_count": evidence_count
        },
        "cost_metrics": {
            "tavily_cost": tavily_cost,
            "llm_cost": telemetry["cost"]
        }
    }