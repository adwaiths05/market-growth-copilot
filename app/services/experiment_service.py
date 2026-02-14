from typing import Dict, Any

class ExperimentService:
    """
    Manages prompt versions and agent configurations to allow for 
    A/B testing and rapid optimization of the agentic pipeline.
    """
    
    _PROMPT_REGISTRY = {
        "planner": {
            "v1": "You are a Senior E-commerce Strategist. Decompose the analysis into 3 steps.",
            "v2": "You are a Marketplace Growth Lead. Create a 5-step detailed research plan."
        },
        "researcher": {
            "v1": "Summarize the following web search results into facts.",
            "v2": "Extract pricing, shipping costs, and competitor review sentiment from these results."
        }
    }

    @classmethod
    def get_prompt(cls, agent_name: str, version: str = "v1") -> str:
        """Retrieves a specific version of a prompt for an agent."""
        return cls._PROMPT_REGISTRY.get(agent_name, {}).get(version, "")

    @staticmethod
    def log_experiment_result(job_id: str, version_map: Dict[str, str], score: float):
        """Logs which versions were used for a job to track performance."""
        print(f"--- EXPERIMENT: Job {job_id} used {version_map} | Score: {score} ---")