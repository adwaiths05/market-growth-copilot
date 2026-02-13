import os
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from tavily import TavilyClient

# 1. Initialize Clients
# Mistral Small is 80% cheaper/faster than Large - perfect for the Free Tier
llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0, 
    max_tokens=700
)

# Initialize Tavily with your free API key from .env
tavily = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

async def research_node(state):
    """
    The Research Agent: Uses Tavily to find real-world data about the product URL.
    """
    url = state.get("product_url")
    plan = state.get("research_plan", "Analyze product pricing and competitors.")
    
    print(f"--- RESEARCHER: Searching the web for {url} ---")
    
    try:
        # 2. Execute Web Search
        # We search for the specific URL + the plan requirements
        search_query = f"Current price, shipping, and competitor deals for: {url}"
        
        # 'search_depth="basic"' costs only 1 credit per search (1,000 free/month)
        search_result = tavily.search(
            query=search_query,
            search_depth="basic",
            max_results=3
        )
        
        # 3. Process Search Results into Context
        # We extract the 'content' snippets which are already optimized for LLMs
        context = "\n\n".join(
            [f"Source: {res['url']}\nContent: {res['content']}" 
             for res in search_result.get('results', [])]
        )
        
        # 4. Let Mistral summarize the findings
        prompt = [
            SystemMessage(content="You are a Market Research Assistant. Summarize the following web search results into a concise list of pricing and competitor facts."),
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