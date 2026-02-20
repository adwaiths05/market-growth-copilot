import time
from typing import List, Optional
from pydantic import BaseModel, Field
from langchain_mistralai import ChatMistralAI
from app.core.config import settings

# 1. Define the Strict Audit Contract
class StrategyCritique(BaseModel):
    is_valid: bool = Field(description="Whether the strategy is logically sound and grounded in research.")
    critique_points: List[str] = Field(description="Specific strengths or weaknesses identified.")
    confidence_score: float = Field(description="Confidence in the strategy (0.0 to 1.0).")
    recommendation: str = Field(description="Final validation note or suggested adjustment.")

# 2. Initialize LLM with Structured Output capability
llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0,
    api_key=settings.MISTRAL_API_KEY
).with_structured_output(StrategyCritique)

async def critic_node(state):
    """
    Critic Agent refactored for 100% Structured Contract Compliance.
    Standardizes the final review into a machine-readable audit.
    """
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry
    
    final_result = state.get("analysis_result")
    # Extract the strategy content for the prompt
    strategy_text = final_result.growth_strategy if final_result else "No strategy provided."
    
    prompt = (
        f"You are a Senior Market Analyst. Review this growth strategy for {state['product_url']}: "
        f"\n\nSTRATEGY:\n{strategy_text}\n\n"
        "Provide a structured critique checking for data grounding, feasibility, and market relevance."
    )
    
    try:
        # 3. Execution with Automatic Schema Validation
        # The response is now a StrategyCritique object, not a string.
        audit_report: StrategyCritique = await llm.ainvoke(prompt)
    except Exception as e:
        return {
            "status": "failed",
            "error": f"Critic failed schema validation: {str(e)}"
        }
    
    telemetry = track_telemetry(None, "critic", start_time)
    
    # 4. Update the structured state
    if final_result:
        # We attach the structured audit results to the result object
        final_result.critic_review = audit_report.model_dump_json()
    
    return {
        "analysis_result": final_result, 
        "status": "completed",
        "total_tokens": telemetry.get("tokens", 0),
        "total_cost": telemetry.get("cost", 0.0),
        "node_metrics": telemetry.get("metrics", {})
    }