from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime

class GoalCategory(str, Enum):
    ACADEMIC = "ACADEMIC"
    PROJECT = "PROJECT"
    CAREER = "CAREER"
    PERSONAL = "PERSONAL"

class Goal(BaseModel):
    id: str
    title: str
    description: Optional[str] = ""
    category: GoalCategory = GoalCategory.ACADEMIC
    deadline: Optional[datetime] = None
    target_score: Optional[float] = None
    progress: float = Field(0.0, ge=0.0, le=1.0)
    related_task_ids: List[str] = []
