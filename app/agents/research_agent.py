import time
import os
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from tavily import TavilyClient

from app.core.config import settings
from app.services.knowledge_service import kb_service
from app.services.experiment_service import ExperimentService

llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0, 
    api_key=settings.MISTRAL_API_KEY
)

tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

async def research_node(state):
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    url = state.get("product_url")
    job_id = state.get("job_id")
    system_instruction = ExperimentService.get_prompt("researcher", version="v1")
    
    print(f"--- RESEARCHER: Searching the web for {url} ---")
    
    try:
        # 1. Web Search
        search_query = f"Current price, shipping, and competitor deals for: {url}"
        search_result = tavily.search(query=search_query, search_depth="basic", max_results=3)
        
        context = "\n\n".join(
            [f"Source: {res['url']}\nContent: {res['content']}" 
             for res in search_result.get('results', [])]
        )
        
        # 2. Persist to Knowledge Base for RAG
        if context.strip():
            await kb_service.add_research_to_kb(job_id, context)
        
        # 3. Summarization
        prompt = [
            SystemMessage(content=system_instruction),
            HumanMessage(content=f"Product URL: {url}\nSearch Context: {context}")
        ]
        
        response = await llm.ainvoke(prompt)
        telemetry = track_telemetry(response, "researcher", start_time)
        
        return {
            "research_data": [response.content],
            "status": "research_completed",
            "total_tokens": telemetry["tokens"],
            "total_cost": telemetry["cost"],
            "node_metrics": telemetry["metrics"]
        }

    except Exception as e:
        return {
            "research_data": [f"Error during research: {str(e)}"],
            "status": "failed",
            "node_metrics": {"researcher": {"error": str(e)}}
        }