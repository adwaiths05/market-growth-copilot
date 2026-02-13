from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatMistralAI(model="mistral-small-latest", temperature=0)

async def analytics_node(state):
    print("--- ANALYTICS: Extracting key marketplace metrics ---")
    research_blob = "\n".join(state.get("research_data", []))
    
    prompt = [
        SystemMessage(content="You are a Market Analyst. Extract a structured JSON-like summary of: 1. Average Price 2. Top Competitor 3. Key Selling Points found in the data."),
        HumanMessage(content=f"Analyze this research: {research_blob}")
    ]
    
    response = await llm.ainvoke(prompt)
    return {"analysis_result": {"metrics": response.content}, "status": "analyzed"}