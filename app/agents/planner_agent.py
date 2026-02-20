import time
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings

llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0, 
    api_key=settings.MISTRAL_API_KEY
)

async def planner_node(state):
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry # Local import to avoid circularity
    
    prompt = [
        SystemMessage(content="You are a Senior E-commerce Strategist. Decompose the analysis of this product URL into 3 actionable research steps."),
        HumanMessage(content=state['product_url'])
    ]
    
    response = await llm.ainvoke(prompt)
    telemetry = track_telemetry(response, "planner", start_time)
    
    return {
        "research_plan": response.content,
        "status": "planning_completed",
        "total_tokens": telemetry["tokens"],
        "total_cost": telemetry["cost"],
        "node_metrics": telemetry["metrics"]
    }