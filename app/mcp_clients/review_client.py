# app/mcp_clients/review_client.py
import json
from mcp.server.fastmcp import FastMCP
from firecrawl import FirecrawlApp
from pydantic import BaseModel, Field
from typing import List
from app.core.config import settings

mcp = FastMCP("ReviewServer")

# Define the exact JSON structure we want Firecrawl to return
class ReviewSchema(BaseModel):
    pros: List[str] = Field(description="Top 3 praise points or advantages mentioned in customer reviews.")
    cons: List[str] = Field(description="Top 3 complaints, flaws, or disadvantages mentioned in reviews.")

@mcp.tool()
async def analyze_product_reviews(product_url: str) -> str:
    """
    Extracts top 3 customer complaints and top 3 praise points from a live product page using Firecrawl.
    """
    if not settings.FIRECRAWL_API_KEY:
        return "System Error: FIRECRAWL_API_KEY is not configured."

    try:
        app = FirecrawlApp(api_key=settings.FIRECRAWL_API_KEY)
        
        # Tell Firecrawl to scrape the URL and extract data matching our Pydantic Schema
        data = app.scrape_url(
            product_url, 
            params={
                'formats': ['extract'],
                'extract': {
                    'schema': ReviewSchema.model_json_schema()
                }
            }
        )
        
        extracted_data = data.get('extract', {})
        if not extracted_data:
            return "Failed to extract review sentiment from the provided URL."
            
        # Return as a JSON string so LangGraph can easily read it
        return json.dumps({
            "pros": extracted_data.get("pros", ["No clear pros found"]),
            "cons": extracted_data.get("cons", ["No clear cons found"])
        })
        
    except Exception as e:
        return f"Error executing Review Tool: {str(e)}"

if __name__ == "__main__":
    mcp.run()