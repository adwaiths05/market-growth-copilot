from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage

llm = ChatMistralAI(model="mistral-small-latest", temperature=0, max_tokens=700, timeout=30)

async def planner_node(state):
    print(f"--- PLANNER: Strategic Planning for {state['product_url']} ---")
    
    prompt = [
        SystemMessage(content="You are a Senior E-commerce Strategist. Decompose the analysis of this product URL into 3 actionable research steps."),
        HumanMessage(content=state['product_url'])
    ]
    
    response = await llm.ainvoke(prompt)
    
    return {
        "research_plan": response.content,
        "status": "planning_completed"
    }