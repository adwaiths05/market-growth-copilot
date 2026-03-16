import time
from langchain_mistralai import ChatMistralAI
from app.core.config import settings
from app.schemas.agent_schemas import OptimizationOutput, AgentAnalysisOutput
import asyncio

# Initialize LLM only if not in demo mode or if key is present
llm = None
if getattr(settings, "DEMO_MODE", False) == False and settings.MISTRAL_API_KEY:
    llm = ChatMistralAI(
        model="mistral-small-latest", 
        api_key=settings.MISTRAL_API_KEY,
        temperature=0,
    max_retries=5, 
    timeout=60
    ).with_structured_output(OptimizationOutput, include_raw=True)

async def optimization_node(state):
    """
    Optimization Agent: Suggests 3 growth strategies. 
    Bypasses LLM if DEMO_MODE is enabled.
    """
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    current_result = state.get("analysis_result")
    if current_result is None:
        # Ensure we always have a container for downstream agents
        current_result = AgentAnalysisOutput()
    
    # Extract evidence from the state passed by the Research Agent
    prev_confidence = state.get("confidence_metrics", {})
    evidence = prev_confidence.get("evidence_count", 0)
    
    # 1. Handle Demo Mode Execution
    if getattr(settings, "DEMO_MODE", False):
        demo_output = OptimizationOutput(
            growth_strategies=[
                "Implement dynamic pricing based on competitor stock levels.",
                "Optimize product titles with high-conversion keywords found in reviews.",
                "Bundle slow-moving inventory with top-sellers to increase AOV."
            ],
            priority_level="High"
        )
        if current_result:
            current_result.growth_strategy = demo_output
        
        end_time = time.time()
        return {
            "analysis_result": current_result,
            "status": "optimized",
            "total_tokens": 0,
            "total_cost": 0.0,
            "execution_timeline": [{
                "step": "AI Optimization (Demo)",
                "start_time": round(start_time, 2),
                "end_time": round(end_time, 2),
                "duration_seconds": round(end_time - start_time, 2)
            }],
            "confidence_metrics": {"confidence_score": 0.99},
            "cost_metrics": {"llm_cost": 0.0},
            "node_metrics": {
                "optimization": {
                    "latency_sec": round(end_time - start_time, 2),
                    "status": "demo_success"
                }
            }
        }

    # 2. Live Mode Execution
    metrics = current_result.metrics if current_result else "No metrics available"
    prompt = f"Based on these metrics: {metrics}, suggest 3 growth strategies for {state.get('product_url')}."
    
    try:
        if not llm:
            raise ValueError("LLM not initialized. Check MISTRAL_API_KEY.")
        await asyncio.sleep(1.5)
        result = await llm.ainvoke(prompt)
        telemetry = track_telemetry(result['raw'], "optimization", start_time)
        
        if current_result:
            current_result.growth_strategy = result['parsed']
            
        # Calculate real confidence heuristic based on research evidence
        base_confidence = 0.40
        if evidence > 3: base_confidence += 0.25
        if evidence > 10: base_confidence += 0.10
        confidence_score = min(0.98, base_confidence)
        
        end_time = time.time()
        
        return {
            "analysis_result": current_result,
            "status": "optimized",
            "total_tokens": telemetry["tokens"],
            "total_cost": telemetry["cost"],
            "node_metrics": telemetry["metrics"],
            # --- REAL-DATA METRICS ---
            "execution_timeline": [{
                "step": "AI Optimization (Mistral)",
                "start_time": round(start_time, 2),
                "end_time": round(end_time, 2),
                "duration_seconds": round(end_time - start_time, 2)
            }],
            "confidence_metrics": {"confidence_score": round(confidence_score, 2)},
            "cost_metrics": {"llm_cost": telemetry["cost"]}
        }
    except Exception as e:
        return {"status": "failed", "node_metrics": {"optimization": {"error": str(e)}}}