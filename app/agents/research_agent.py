import os
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from tavily import TavilyClient

# Import core configurations and new services
from app.core.config import settings
from app.services.knowledge_service import KnowledgeService
from app.services.experiment_service import ExperimentService

# 1. Initialize Clients and Services
kb_service = KnowledgeService()

# Mistral Small is 80% cheaper/faster than Large - perfect for the Free Tier
llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0, 
    max_tokens=700,
    api_key=settings.MISTRAL_API_KEY
)

# Initialize Tavily using validated settings
tavily = TavilyClient(api_key=settings.TAVILY_API_KEY)

async def research_node(state):
    """
    The Research Agent: 
    1. Fetches a dynamic prompt from ExperimentService.
    2. Uses Tavily to find real-world data.
    3. Persists results to the Knowledge Base (pgvector) for RAG.
    """
    url = state.get("product_url")
    job_id = state.get("job_id")
    
    # Use Experiment Service to get the system prompt (A/B testing enabled)
    system_instruction = ExperimentService.get_prompt("researcher", version="v1")
    
    print(f"--- RESEARCHER: Searching the web for {url} ---")
    
    try:
        # 2. Execute Web Search
        search_query = f"Current price, shipping, and competitor deals for: {url}"
        
        # 'search_depth="basic"' costs only 1 credit per search
        search_result = tavily.search(
            query=search_query,
            search_depth="basic",
            max_results=3
        )
        
        # 3. Process Search Results into Context
        context = "\n\n".join(
            [f"Source: {res['url']}\nContent: {res['content']}" 
             for res in search_result.get('results', [])]
        )
        
        # 4. Save the raw findings to the Knowledge Base (RAG Pipeline)
        # This chunks and embeds the text into the product_embeddings table
        if context.strip():
            await kb_service.add_research_to_kb(job_id, context)
        
        # 5. Let Mistral summarize the findings using the Experiment Service prompt
        prompt = [
            SystemMessage(content=system_instruction),
            HumanMessage(content=f"Product URL: {url}\nSearch Context: {context}")
        ]
        
        response = await llm.ainvoke(prompt)
        
        return {
            "research_data": [response.content],
            "status": "research_completed"
        }

    except Exception as e:
        print(f"--- RESEARCHER ERROR: {str(e)} ---")
        return {
            "research_data": [f"Error during research: {str(e)}"],
            "status": "failed"
        }