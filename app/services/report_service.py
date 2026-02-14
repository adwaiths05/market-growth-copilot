from typing import Dict, Any

class ReportService:
    @staticmethod
    def generate_summary(analysis_result: Dict[str, Any]) -> str:
        """Formats the agent findings into a clean executive summary."""
        if not analysis_result:
            return "Analysis in progress..."
            
        metrics = analysis_result.get("agent_analysis", {}).get("metrics", "N/A")
        strategy = analysis_result.get("agent_analysis", {}).get("growth_strategy", "N/A")
        
        return f"""
        ### Executive Marketplace Report
        **Market Metrics:** {metrics}
        
        **Recommended Growth Strategies:**
        {strategy}
        
        **Final Quality Review:**
        {analysis_result.get('agent_analysis', {}).get('critic_review', 'Pending')}
        """