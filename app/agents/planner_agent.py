import time
from typing import List
from pydantic import BaseModel, Field
from langchain_mistralai import ChatMistralAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.core.config import settings
import asyncio

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
    api_key=settings.MISTRAL_API_KEY,
    max_retries=5, 
    timeout=60,
).with_structured_output(PlannerOutput)

async def planner_node(state):
    """
    Planner Agent: Generates a 3-step research plan with full telemetry.
    """
    start_time = time.time()
    from app.agents.orchestrator import track_telemetry 
    
    prompt = [
        SystemMessage(content=(
            "You are a Senior E-commerce Strategist. "
            "Decompose the analysis of the provided product URL into a structured 3-step research plan."
        )),
        HumanMessage(content=f"Analyze this URL: {state['product_url']}")
    ]
    
    try:
        # result contains {'parsed': PlannerOutput, 'raw': AIMessage}
        await asyncio.sleep(1.5)
        result = await llm.ainvoke(prompt)
        response_model = result['parsed']
        raw_message = result['raw']
        
        # Capture real token usage from the raw AIMessage
        telemetry = track_telemetry(raw_message, "planner", start_time) 
        
        return {
            "research_plan": response_model.model_dump_json(),
            "status": "planning_completed",
            "total_tokens": telemetry.get("tokens", 0),
            "total_cost": telemetry.get("cost", 0.0),
            "node_metrics": telemetry.get("metrics", {})
        }
    except Exception as e:
        return {
            "status": "failed",
            "node_metrics": {
                "planner": {
                    "error": str(e), 
                    "latency_sec": round(time.time() - start_time, 2)
                }
            }
        }