from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(model="mistral-small-latest", temperature=0.7) # Slightly higher temp for creativity

async def optimization_node(state):
    print("--- OPTIMIZATION: Generating growth strategies ---")
    metrics = state.get("analysis_result", {}).get("metrics", "")
    
    prompt = f"Based on these market metrics: {metrics}, suggest 3 strategies to increase sales for {state['product_url']}."
    response = await llm.ainvoke(prompt)
    
    # Merge the new strategy into the existing results
    new_result = state["analysis_result"]
    new_result["growth_strategy"] = response.content
    
    return {"analysis_result": new_result, "status": "optimized"}