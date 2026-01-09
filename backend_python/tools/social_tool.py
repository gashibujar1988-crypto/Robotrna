
import os
import requests
import json
from dotenv import load_dotenv

load_dotenv("python_secrets.env")

class LinkedInTool:
    def __init__(self):
        self.client_id = os.getenv("LINKEDIN_CLIENT_ID")
        self.client_secret = os.getenv("LINKEDIN_CLIENT_SECRET")
        self.access_token = os.getenv("LINKEDIN_ACCESS_TOKEN") # Needs to be generated via OAuth flow
        self.author_urn = os.getenv("LINKEDIN_AUTHOR_URN") # urn:li:person:metrics...

    def post(self, text: str):
        """
        Posts a text update to LinkedIn.
        Note: This is complex because it requires a valid 3-legged OAuth token.
        For the prototype, if no token exists, we log the 'Mock' success, 
        but the code is structure for real API usage.
        """
        print(f"[LinkedInTool] -> Preparing post: {text[:50]}...")
        
        if not self.access_token or not self.author_urn:
            return f"[SIMULATION] Posted to LinkedIn: '{text}'\n(Real posting requires a fresh OAuth Access Token)"

        url = "https://api.linkedin.com/v2/ugcPosts"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0"
        }
        
        payload = {
            "author": self.author_urn,
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": text
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }

        try:
            response = requests.post(url, headers=headers, json=payload)
            response.raise_for_status()
            return f"Successfully posted to LinkedIn! ID: {response.json().get('id')}"
        except Exception as e:
            return f"[ERROR] LinkedIn Post failed: {str(e)}"

    def create_draft(self, text: str):
        """
        Does not post. Returns a formatted string that the Frontend detects as a Draft.
        Format: DRAFT_READY|{"platform": "linkedin", "content": "..."}
        """
        print(f"[LinkedInTool] -> Creating draft: {text[:50]}...")
        # Escape quotes for JSON safety manually if needed, or just let json.dumps handle it
        payload = json.dumps({"platform": "linkedin", "content": text})
        return f"DRAFT_READY|{payload}"

if __name__ == "__main__":
    tool = LinkedInTool()
    print(tool.post("Hello World from Python Brain! 🐍"))
