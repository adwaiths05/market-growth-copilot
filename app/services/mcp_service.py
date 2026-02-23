import asyncio
import json
import logging
from typing import Any, Dict
import redis.async_io as redis
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Redis client for Performance Layer caching
redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
MCP_CACHE_EXPIRY = 600  # 10-minute cache for tool responses

class MCPManager:
    """
    The MCPManager serves as the central bridge between LangGraph agents 
    and specialized tools with integrated Redis caching for performance.
    """

    @staticmethod
    async def call_tool(client_filename: str, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """
        Connects to a specific MCP server and executes a tool call with caching.
        """
        # 1. Performance Layer: Generate unique cache key based on tool and arguments
        # Using sorted arguments to ensure identical calls produce the same key
        arg_hash = hash(frozenset(sorted(arguments.items())))
        cache_key = f"mcp_cache:{tool_name}:{arg_hash}"

        # 2. Cache Lookup
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                logger.info(f"--- MCP CACHE HIT: {tool_name} ---")
                return json.loads(cached_data)
        except Exception as cache_err:
            logger.warning(f"MCP Cache lookup failed: {cache_err}")

        # 3. Cache Miss: Execute Subprocess
        server_params = StdioServerParameters(
            command="python",
            args=[f"app/mcp_clients/{client_filename}"]
        )
        
        try:
            logger.info(f"--- MCP: Connecting to {client_filename} for tool '{tool_name}' ---")
            
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    await session.initialize()
                    
                    # Execute tool
                    result = await session.call_tool(tool_name, arguments)
                    
                    # 4. Update Cache for future performance
                    if result.content:
                        await redis_client.set(
                            cache_key, 
                            json.dumps(result.content), 
                            ex=MCP_CACHE_EXPIRY
                        )
                    
                    return result.content
                    
        except Exception as e:
            logger.error(f"--- MCP ERROR ({client_filename}): {str(e)} ---")
            return f"Error executing tool {tool_name}: {str(e)}"

    async def get_market_intelligence(self, product_url: str) -> Dict[str, Any]:
        """Aggregates external marketplace data."""
        pricing = await self.call_tool("pricing_client.py", "get_competitor_prices", {"product_url": product_url})
        reviews = await self.call_tool("review_client.py", "analyze_product_reviews", {"product_url": product_url})
        
        return {
            "pricing_data": pricing,
            "review_sentiment": reviews
        }

    async def get_internal_context(self, product_id: str) -> Dict[str, Any]:
        """Aggregates internal business unit data."""
        inventory = await self.call_tool("inventory_client.py", "get_stock_levels", {"product_id": product_id})
        catalog = await self.call_tool("catalog_client.py", "get_product_economics", {"product_id": product_id})
        
        return {
            "inventory_status": inventory,
            "unit_economics": catalog
        }

# Singleton instance for application-wide access
mcp_manager = MCPManager()