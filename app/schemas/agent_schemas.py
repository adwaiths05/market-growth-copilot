from pydantic import BaseModel, Field
from typing import List, Optional

class ResearchStep(BaseModel):
    step_number: int
    task: str
    rationale: str

class PlannerOutput(BaseModel):
    research_plan_title: str
    steps: List[ResearchStep]
    estimated_complexity: str

class AnalyticsMetrics(BaseModel):
    average_price: float = Field(description="The calculated average market price")
    top_competitor: str = Field(description="Primary market competitor identified")
    key_selling_points: List[str] = Field(description="Features driving sales")
    customer_sentiment: str = Field(description="Summary of customer feedback")

class OptimizationOutput(BaseModel):
    growth_strategies: List[str] = Field(description="3 actionable growth strategies", min_length=3, max_length=3)
    priority_level: str = Field(description="High, Medium, or Low")

class StrategyCritique(BaseModel):
    is_valid: bool = Field(description="Whether the strategy is logically sound")
    critique_points: List[str] = Field(description="Strengths or weaknesses identified")
    confidence_score: float = Field(ge=0, le=1.0)
    recommendation: str = Field(description="Final validation note")

class AgentAnalysisOutput(BaseModel):
    """The complete structured contract for the analysis pipeline."""
    metrics: Optional[AnalyticsMetrics] = None
    growth_strategy: Optional[OptimizationOutput] = None
    critic_review: Optional[StrategyCritique] = None
    confidence_score: float = Field(default=1.0, ge=0, le=1.0)