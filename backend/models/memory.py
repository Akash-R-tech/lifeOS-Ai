from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime

class MemoryCategory(str, Enum):
    USER_PREFERENCE = "USER_PREFERENCE"
    GOAL = "GOAL"
    PROJECT = "PROJECT"
    TASK = "TASK"
    DEADLINE = "DEADLINE"
    DECISION = "DECISION"
    EVENT = "EVENT"
    CONVERSATION_SUMMARY = "CONVERSATION_SUMMARY"
    WORK_PROGRESS = "WORK_PROGRESS"

class MemoryItem(BaseModel):
    id: str
    category: MemoryCategory
    content: str
    metadata: Dict[str, Any] = {}
    created_at: datetime = datetime.utcnow()
    embedding: Optional[List[float]] = None
