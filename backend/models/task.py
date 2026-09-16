from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class TaskStatus(str, Enum):
    NOT_STARTED = "NOT_STARTED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    POSTPONED = "POSTPONED"

class Subtask(BaseModel):
    id: str
    title: str
    estimated_minutes: int = 30
    completed: bool = False

class Task(BaseModel):
    id: str
    name: str
    description: Optional[str] = ""
    deadline: Optional[datetime] = None
    estimated_duration_minutes: int = 60
    urgency: float = Field(0.5, ge=0.0, le=1.0)
    importance: float = Field(0.5, ge=0.0, le=1.0)
    goal_relevance: float = Field(0.5, ge=0.0, le=1.0)
    consequence: float = Field(0.5, ge=0.0, le=1.0)
    priority_score: Optional[float] = 0.0
    progress: float = Field(0.0, ge=0.0, le=1.0)
    status: TaskStatus = TaskStatus.NOT_STARTED
    dependencies: List[str] = []
    subtasks: List[Subtask] = []
    source: str = "user"  # e.g., "gmail", "classroom", "user"
    workspace_path: Optional[str] = None
    marks_value: Optional[float] = None
