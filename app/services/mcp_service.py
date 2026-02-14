import asyncio
from typing import Any, Dict, Optional
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

class MCPManager:
    """
    The MCPManager serves as the central bridge between the LangGraph agents 
    and the specialized tools defined in the mcp_clients/ directory.
    
    It follows a modular pattern to allow independent scaling of pricing, 
    review, inventory, and catalog intelligence.
    """

    @staticmethod
    async def call_tool(client_filename: str, tool_name: str, arguments: Dict[str, Any]) -> Any:
        """
        Connects to a specific MCP server file and executes a tool call.
        
        Args:
            client_filename: The name of the file in mcp_clients/ (e.g., 'pricing_client.py').
            tool_name: The specific function/tool defined within that MCP server.
            arguments: The parameters required by the tool.
        """
        # Configuration to run the specific client as a subprocess
        server_params = StdioServerParameters(
            command="python",
            args=[f"mcp_clients/{client_filename}"]
        )
        
        try:
            print(f"--- MCP: Connecting to {client_filename} for tool '{tool_name}' ---")
            
            async with stdio_client(server_params) as (read, write):
                async with ClientSession(read, write) as session:
                    # Establish the connection
                    await session.initialize()
                    
                    # Execute the requested tool
                    result = await session.call_tool(tool_name, arguments)
                    
                    # Return the content of the tool execution
                    return result.content
                    
        except Exception as e:
            print(f"--- MCP ERROR ({client_filename}): {str(e)} ---")
            return f"Error executing tool {tool_name}: {str(e)}"

    async def get_market_intelligence(self, product_url: str) -> Dict[str, Any]:
        """
        Helper method to aggregate data from external marketplace clients.
        """
        pricing = await self.call_tool("pricing_client.py", "get_competitor_prices", {"product_url": product_url})
        reviews = await self.call_tool("review_client.py", "analyze_product_reviews", {"product_url": product_url})
        
        return {
            "pricing_data": pricing,
            "review_sentiment": reviews
        }

    async def get_internal_context(self, product_id: str) -> Dict[str, Any]:
        """
        Helper method to aggregate data from internal business clients.
        """
        inventory = await self.call_tool("inventory_client.py", "get_stock_levels", {"product_id": product_id})
        catalog = await self.call_tool("catalog_client.py", "get_product_economics", {"product_id": product_id})
        
        return {
            "inventory_status": inventory,
            "unit_economics": catalog
        }

# Singleton instance for application-wide access
mcp_manager = MCPManager()