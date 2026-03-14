# app/mcp_clients/pricing_client.py
import urllib.parse
import requests
from mcp.server.fastmcp import FastMCP
from app.core.config import settings

mcp = FastMCP("PricingServer")

@mcp.tool()
async def get_competitor_prices(product_url: str) -> str:
    """
    Fetches real-time competitor pricing for a given marketplace product using Google Shopping (SerpAPI).
    """
    if not settings.SERPAPI_API_KEY:
        return "System Error: SERPAPI_API_KEY is not configured."

    # Basic heuristic to extract a search term from the URL
    parsed_url = urllib.parse.urlparse(product_url)
    path_parts = [p for p in parsed_url.path.split('/') if p]
    search_query = path_parts[-1] if path_parts else product_url
    search_query = search_query.replace('-', ' ')

    params = {
        "engine": "google_shopping",
        "q": search_query,
        "api_key": settings.SERPAPI_API_KEY,
        "hl": "en",
        "gl": "us"
    }

    try:
        response = requests.get("https://serpapi.com/search", params=params)
        response.raise_for_status()
        data = response.json()
        
        shopping_results = data.get("shopping_results", [])
        if not shopping_results:
            return f"Pricing Analysis: No competitor data found for '{search_query}' on Google Shopping."
        
        # Extract valid prices from the results
        prices = [item.get("extracted_price") for item in shopping_results if item.get("extracted_price")]
        
        if not prices:
            return f"Pricing Analysis: Found competitor products, but failed to extract exact numerical prices."
            
        avg_price = sum(prices) / len(prices)
        min_price = min(prices)
        max_price = max(prices)
        
        return f"Real-time Pricing Analysis for '{search_query}': Avg: ${avg_price:.2f}, Min: ${min_price:.2f}, Max: ${max_price:.2f}"
        
    except Exception as e:
        return f"Error executing Pricing Tool: {str(e)}"

if __name__ == "__main__":
    mcp.run()