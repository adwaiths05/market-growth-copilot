import time
from typing import List
from pydantic import BaseModel, Field
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings

# 1. Define the Strict Contract
class ResearchStep(BaseModel):
    step_number: int = Field(description="The sequential order of the task.")
    task: str = Field(description="Clear description of the research action.")
    rationale: str = Field(description="Why this step is necessary for growth analysis.")

class PlannerOutput(BaseModel):
    research_plan_title: str = Field(description="A brief title for the execution plan.")
    steps: List[ResearchStep] = Field(description="List of 3 actionable research steps.")
    estimated_complexity: str = Field(description="Low, Medium, or High.")

# 2. Initialize LLM with Structured Output capability
llm = ChatMistralAI(
    model="mistral-small-latest", 
    temperature=0, 
    api_key=settings.MISTRAL_API_KEY
).with_structured_output(PlannerOutput)

async def planner_node(state):
    """
    Planner Agent refactored for 100% Structured Contract Compliance.
    Eliminates manual string parsing and ensures schema validation.
    """
    start_time = time.time()
    # Local import to avoid circular dependency with orchestrator telemetry helpers
    from app.agents.orchestrator import track_telemetry 
    
    prompt = [
        SystemMessage(content=(
            "You are a Senior E-commerce Strategist. "
            "Decompose the analysis of the provided product URL into a structured 3-step research plan. "
            "Focus on market positioning, competitor pricing, and optimization opportunities."
        )),
        HumanMessage(content=f"Analyze this URL: {state['product_url']}")
    ]
    
    # 3. Execution with Automatic Validation
    # If the LLM output doesn't match PlannerOutput, it raises a validation error immediately.
    try:
        response: PlannerOutput = await llm.ainvoke(prompt)
    except Exception as e:
        # Fallback logic or error reporting for production resilience
        return {
            "status": "failed",
            "error": f"Planner failed schema validation: {str(e)}"
        }
    
    # Mock telemetry since the raw 'response' object is now a Pydantic model
    # in production, you'd wrap this to capture raw tokens if needed
    telemetry = track_telemetry(None, "planner", start_time) 
    
    # 4. Return strictly typed data to the LangGraph state
    return {
        "research_plan": response.model_dump_json(), # Store as JSON string for persistence
        "status": "planning_completed",
        "total_tokens": telemetry.get("tokens", 0),
        "total_cost": telemetry.get("cost", 0.0),
        "node_metrics": telemetry.get("metrics", {})
    }