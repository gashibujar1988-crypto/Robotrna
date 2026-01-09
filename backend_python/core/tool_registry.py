
from tools.social_tool import LinkedInTool
from tools.search_tool import GoogleSearchTool

# Initialize Tools
linkedin = LinkedInTool()
search = GoogleSearchTool()

TOOL_MAP = {
    # Social Tools
    "linkedin_post": linkedin.post,
    "linkedin_draft": linkedin.create_draft,
    
    # Search Tools
    "google_search": search.search,
    "hunter_io_search": lambda q: "[Mock] Found email: ceo@example.com (Hunter Tool Pending)",
    
    # Utility
    "calendar_read": lambda q: "[Mock] Calendar is clear.",
    "email_draft": lambda q: f"[Mock] Drafted email about {q}",
}

def execute_tool(tool_name: str, argument: str):
    """
    Executes a tool by name with the given argument.
    """
    if tool_name in TOOL_MAP:
        try:
            print(f"[ToolRegistry] Executing {tool_name} with arg: {argument}")
            return TOOL_MAP[tool_name](argument)
        except Exception as e:
            return f"Error executing {tool_name}: {str(e)}"
    return f"Tool '{tool_name}' not found."
