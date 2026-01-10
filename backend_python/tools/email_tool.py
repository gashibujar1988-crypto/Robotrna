
import os
import base64
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
from dotenv import load_dotenv

load_dotenv("python_secrets.env")

class GmailTool:
    """
    Gmail API integration for sending emails via Dexter agent.
    Requires OAuth 2.0 credentials from Google Cloud Console.
    """
    def __init__(self):
        self.client_id = os.getenv("GMAIL_CLIENT_ID")
        self.client_secret = os.getenv("GMAIL_CLIENT_SECRET")
        self.refresh_token = os.getenv("GMAIL_REFRESH_TOKEN")
        self.service = None
        
        if all([self.client_id, self.client_secret, self.refresh_token]):
            self._initialize_service()
    
    def _initialize_service(self):
        """Initialize Gmail API service with OAuth credentials"""
        try:
            creds = Credentials(
                token=None,
                refresh_token=self.refresh_token,
                token_uri="https://oauth2.googleapis.com/token",
                client_id=self.client_id,
                client_secret=self.client_secret
            )
            self.service = build('gmail', 'v1', credentials=creds)
            print("[GmailTool] ✅ Gmail API initialized successfully")
        except Exception as e:
            print(f"[GmailTool] ❌ Failed to initialize: {e}")
            self.service = None
    
    def send_email(self, to: str, subject: str, body: str, html: bool = True):
        """
        Send an email via Gmail API.
        
        Args:
            to: Recipient email address
            subject: Email subject
            body: Email body content
            html: If True, send as HTML. Otherwise plain text.
        
        Returns:
            Success message or simulation notice
        """
        print(f"[GmailTool] → Preparing email to {to}")
        
        # Simulation mode if no credentials
        if not self.service:
            return f"""[SIMULATION MODE] 
Email would be sent to: {to}
Subject: {subject}
Body: {body[:100]}...

⚠️ To send real emails, add Gmail OAuth credentials to python_secrets.env
Run: python tools/gmail_oauth_setup.py (to be created)
"""
        
        try:
            # Create message
            if html:
                message = MIMEMultipart('alternative')
                message['to'] = to
                message['subject'] = subject
                
                # Plain text fallback
                text_part = MIMEText(body, 'plain')
                html_part = MIMEText(body, 'html')
                
                message.attach(text_part)
                message.attach(html_part)
            else:
                message = MIMEText(body)
                message['to'] = to
                message['subject'] = subject
            
            # Encode message
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            # Send via Gmail API
            sent_message = self.service.users().messages().send(
                userId='me',
                body={'raw': raw_message}
            ).execute()
            
            message_id = sent_message.get('id')
            print(f"[GmailTool] ✅ Email sent successfully! ID: {message_id}")
            
            return f"✅ Email sent to {to}! Message ID: {message_id}"
            
        except HttpError as error:
            error_msg = f"Gmail API error: {error}"
            print(f"[GmailTool] ❌ {error_msg}")
            return f"❌ {error_msg}"
        except Exception as e:
            error_msg = f"Error sending email: {str(e)}"
            print(f"[GmailTool] ❌ {error_msg}")
            return f"❌ {error_msg}"
    
    def create_draft(self, to: str, subject: str, body: str):
        """
        Create a draft email (for approval before sending).
        """
        print(f"[GmailTool] → Creating draft for {to}")
        
        if not self.service:
            return f"[DRAFT] To: {to} | Subject: {subject} | Body: {body[:100]}..."
        
        try:
            message = MIMEText(body)
            message['to'] = to
            message['subject'] = subject
            
            raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
            
            draft = self.service.users().drafts().create(
                userId='me',
                body={'message': {'raw': raw_message}}
            ).execute()
            
            draft_id = draft.get('id')
            print(f"[GmailTool] ✅ Draft created! ID: {draft_id}")
            
            return f"✅ Draft created! ID: {draft_id}. Ready to send."
            
        except Exception as e:
            return f"❌ Error creating draft: {str(e)}"

# For testing
if __name__ == "__main__":
    tool = GmailTool()
    result = tool.send_email(
        to="test@example.com",
        subject="Test from Dexter",
        body="Hello! This is a test email from the Robotrna Python backend."
    )
    print(result)
