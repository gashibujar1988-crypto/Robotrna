
"""
Tool Registry - Maps tool names to their implementations.
Mother Brain uses this registry to execute agent requests.
"""

from tools.social_tool import LinkedInTool
from tools.email_tool import GmailTool

# Initialize tool instances
linkedin_tool = LinkedInTool()
gmail_tool = GmailTool()

# Tool execution mapping
TOOL_FUNCTIONS = {
    # Social Media Tools
    "post_to_linkedin": linkedin_tool.post,
    "create_social_draft": linkedin_tool.create_draft,
    
    # Email Tools
    "send_email": gmail_tool.send_email,
    "create_email_draft": gmail_tool.create_draft,
    
    # Add more tools here as they're implemented
    # "search_places": google_places_tool.search,
    # "google_search": search_tool.search,
}

def execute_tool(tool_name: str, *args, **kwargs):
    """
    Execute a tool by name with given arguments.
    
    Args:
        tool_name: Name of the tool to execute
        *args: Positional arguments for the tool
        **kwargs: Keyword arguments for the tool
    
    Returns:
        Result from the tool execution
    """
    tool_func = TOOL_FUNCTIONS.get(tool_name)
    
    if not tool_func:
        return f"[ERROR] Tool '{tool_name}' not found in registry. Available tools: {list(TOOL_FUNCTIONS.keys())}"
    
    try:
        result = tool_func(*args, **kwargs)
        return result
    except Exception as e:
        return f"[ERROR] Tool '{tool_name}' failed: {str(e)}"

def list_available_tools():
    """Returns list of all available tool names"""
    return list(TOOL_FUNCTIONS.keys())
