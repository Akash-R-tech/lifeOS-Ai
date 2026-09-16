from typing import List, Dict, Any
import logging

logger = logging.getLogger("lifeos.integrations.gmail")

class GmailIntegration:
    """
    Gmail OAuth client and intelligent message parser.
    Classifies incoming emails into LOW, NORMAL, IMPORTANT, URGENT, ACTION_REQUIRED.
    """
    def __init__(self, oauth_token: str = None):
        self.oauth_token = oauth_token
        self.connected = bool(oauth_token)

    async def fetch_unread(self) -> List[Dict[str, Any]]:
        # Mock/Demo or authenticated OAuth fetch
        return []

    def classify_email(self, email_data: Dict[str, Any]) -> str:
        subject = email_data.get("subject", "").lower()
        sender = email_data.get("from", "").lower()
        body = email_data.get("body", "").lower()

        if "assignment" in subject or "deadline" in body or "due tomorrow" in body:
            return "ACTION_REQUIRED"
        if "urgent" in subject or "meeting rescheduled" in subject:
            return "URGENT"
        if "professor" in sender or "dean" in sender or "syllabus" in subject:
            return "IMPORTANT"
        if "newsletter" in body or "unsubscribe" in body:
            return "LOW"
        return "NORMAL"
