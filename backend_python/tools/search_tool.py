
import os
import requests
from dotenv import load_dotenv

load_dotenv("python_secrets.env")

class GoogleSearchTool:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
        self.cx_id = os.getenv("GOOGLE_CSE_ID")
    
    def search(self, query: str, num_results: int = 5):
        """
        Performs a real Google Search using the Custom Search JSON API.
        """
        print(f"[GoogleSearchTool] -> Searching for: {query}")
        
        if not self.api_key or not self.cx_id:
            return "[ERROR] Missing GOOGLE_SEARCH_API_KEY or GOOGLE_CSE_ID. Please update python_secrets.env."

        url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": self.api_key,
            "cx": self.cx_id,
            "q": query,
            "num": num_results
        }
        
        try:
            response = requests.get(url, params=params)
            response.raise_for_status()
            data = response.json()
            
            results = []
            if "items" in data:
                for item in data["items"]:
                    title = item.get("title")
                    link = item.get("link")
                    snippet = item.get("snippet")
                    results.append(f"Title: {title}\nLink: {link}\nSnippet: {snippet}\n---")
            else:
                return "No results found."
                
            return "\n".join(results)
            
        except Exception as e:
            return f"[ERROR] Google Search failed: {str(e)}"

# Simple test if run directly
if __name__ == "__main__":
    tool = GoogleSearchTool()
    print(tool.search("latest AI news"))
