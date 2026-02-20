import time
import json
import redis.async_io as redis
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from tavily import TavilyClient
from app.core.config import settings
from app.services.knowledge_service import kb_service
from app.services.experiment_service import ExperimentService

# 1. Initialize Clients
llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0, 
    api_key=settings.MISTRAL_API_KEY
)

tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

# Redis setup for 100% completion of Step 5
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
CACHE_EXPIRY = 86400  # 24-hour cache window

async def research_node(state):
    """
    Research Agent refactored for 100% Caching and Performance compliance.
    """
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    url = state.get("product_url")
    job_id = state.get("job_id")
    cache_key = f"research_cache:{url}"
    
    # 2. Redis Cache Lookup (Step 5 completion)
    try:
        cached_data = await redis_client.get(cache_key)
        if cached_data:
            print(f"--- RESEARCHER: Cache Hit for {url} ---")
            cached_json = json.loads(cached_data)
            return {
                "research_data": cached_json["data"],
                "status": "research_completed_cached",
                "total_tokens": 0,  # Zero cost for cache hit
                "total_cost": 0.0,
                "node_metrics": {"researcher": {"latency_sec": round(time.time() - start_time, 2), "cache": "hit"}}
            }
    except Exception as cache_err:
        print(f"Cache lookup failed: {cache_err}")

    # 3. Cache Miss: Execute Pipeline
    system_instruction = ExperimentService.get_prompt("researcher", version="v1")
    print(f"--- RESEARCHER: Searching the web for {url} ---")
    
    try:
        # A. Web Search via Tavily
        search_query = f"Current price, shipping, and competitor deals for: {url}"
        search_result = tavily.search(query=search_query, search_depth="basic", max_results=3)
        
        context = "\n\n".join(
            [f"Source: {res['url']}\nContent: {res['content']}" 
             for res in search_result.get('results', [])]
        )
        
        # B. Persist to Knowledge Base for RAG (Step 6 foundation)
        if context.strip():
            await kb_service.add_research_to_kb(job_id, context)
        
        # C. Summarization via Mistral
        prompt = [
            SystemMessage(content=system_instruction),
            HumanMessage(content=f"Product URL: {url}\nSearch Context: {context}")
        ]
        
        response = await llm.ainvoke(prompt)
        telemetry = track_telemetry(response, "researcher", start_time)
        
        research_output = [response.content]

        # 4. Update Cache for future requests (Step 5 completion)
        await redis_client.set(
            cache_key, 
            json.dumps({"data": research_output}), 
            ex=CACHE_EXPIRY
        )
        
        return {
            "research_data": research_output,
            "status": "research_completed",
            "total_tokens": telemetry["tokens"],
            "total_cost": telemetry["cost"],
            "node_metrics": telemetry["metrics"]
        }

    except Exception as e:
        return {
            "research_data": [f"Error during research: {str(e)}"],
            "status": "failed",
            "node_metrics": {"researcher": {"error": str(e), "latency_sec": round(time.time() - start_time, 2)}}
        }