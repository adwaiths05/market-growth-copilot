import asyncio
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("ReviewServer")

@mcp.tool()
async def analyze_product_reviews(product_url: str) -> str:
    """
    Extracts top 3 customer complaints and top 3 praise points from reviews.
    """
    # Placeholder for review scraping and sentiment logic
    return {
        "pros": ["High durability", "Fast shipping", "Premium packaging"],
        "cons": ["Expensive", "Instructions unclear", "Slightly heavy"]
    }

if __name__ == "__main__":
    mcp.run()