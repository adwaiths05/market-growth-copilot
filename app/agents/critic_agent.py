from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-small-latest", temperature=0)

async def critic_node(state):
    print("--- CRITIC: Reviewing final output for accuracy ---")
    strategy = state.get("analysis_result", {}).get("growth_strategy", "")
    
    prompt = f"Review this strategy for the product {state['product_url']}. Is it realistic? Does it mention specific data from the research? Provide a 'Final Approval' note."
    response = await llm.ainvoke(prompt)
    
    final_result = state["analysis_result"]
    final_result["critic_review"] = response.content
    
    return {"analysis_result": final_result, "status": "completed"}