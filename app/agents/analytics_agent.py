import time
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
from app.schemas.agent_schemas import AnalyticsMetrics, AgentAnalysisOutput
from app.services.mcp_service import mcp_manager

llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0,
    api_key=settings.MISTRAL_API_KEY
).with_structured_output(AnalyticsMetrics, include_raw=True)

async def analytics_node(state):
    """
    Analytics Agent: Extracts structured metrics from research and MCP tools.
    """
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    # Gather pricing from local MCP tool
    pricing = await mcp_manager.call_tool("pricing_client.py", "get_prices", {"url": state["product_url"]})
    
    prompt = [
        SystemMessage(content="You are a Market Analyst. Extract structured metrics."),
        HumanMessage(content=f"Research: {state['research_data']}\nPricing: {pricing}")
    ]
    
    try:
        result = await llm.ainvoke(prompt)
        telemetry = track_telemetry(result['raw'], "analytics", start_time)
        
        return {
            "analysis_result": AgentAnalysisOutput(metrics=result['parsed']),
            "status": "analyzed",
            "total_tokens": telemetry["tokens"],
            "total_cost": telemetry["cost"],
            "node_metrics": telemetry["metrics"]
        }
    except Exception as e:
        return {"status": "failed", "node_metrics": {"analytics": {"error": str(e)}}}