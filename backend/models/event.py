from pydantic import BaseModel
from typing import Optional, Any, Dict
from enum import Enum
from datetime import datetime

class EventType(str, Enum):
    NEW_EMAIL = "NEW_EMAIL"
    NEW_ASSIGNMENT = "NEW_ASSIGNMENT"
    NEW_ATTACHMENT = "NEW_ATTACHMENT"
    NEW_CALENDAR_EVENT = "NEW_CALENDAR_EVENT"
    CALENDAR_CHANGED = "CALENDAR_CHANGED"
    DEADLINE_APPROACHING = "DEADLINE_APPROACHING"
    TASK_OVERDUE = "TASK_OVERDUE"
    TASK_NOT_STARTED = "TASK_NOT_STARTED"
    TASK_POSTPONED = "TASK_POSTPONED"
    TASK_COMPLETED = "TASK_COMPLETED"
    FILE_CREATED = "FILE_CREATED"
    FILE_CHANGED = "FILE_CHANGED"
    IMPORTANT_MESSAGE = "IMPORTANT_MESSAGE"
    SCHEDULE_CHANGED = "SCHEDULE_CHANGED"
    GOAL_CHANGED = "GOAL_CHANGED"
    NEW_PROJECT = "NEW_PROJECT"
    USER_REQUEST = "USER_REQUEST"

class ImportanceLevel(str, Enum):
    SILENT = "SILENT"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class SystemEvent(BaseModel):
    id: str
    event_type: EventType
    timestamp: datetime = datetime.utcnow()
    source: str
    data: Dict[str, Any]
    importance: ImportanceLevel = ImportanceLevel.MEDIUM
    processed: bool = False
