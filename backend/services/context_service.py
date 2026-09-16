from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from backend.models.task import Task, TaskStatus, Subtask
from backend.models.goal import Goal, GoalCategory

class ContextService:
    """
    Unified context engine maintaining understanding of the user's situation:
    - Goals (Academic, Career, Projects)
    - Tasks & Subtasks
    - Calendar slots & Free time
    - Communications (Emails, announcements)
    - Active project workspaces
    """
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.goals: Dict[str, Goal] = {}
        self.calendar_events: List[Dict[str, Any]] = []
        self.emails: List[Dict[str, Any]] = []
        self.user_preferences: Dict[str, Any] = {
            "name": "Mapla",
            "daily_work_limit_hours": 6,
            "preferred_focus_time": "EVENING",
            "target_gpa": 9.0,
            "emergency_contact": "prof_advisor@university.edu"
        }
        self.seed_defaults()

    def seed_defaults(self):
        # Initial goals
        g1 = Goal(
            id="g_academic",
            title="Maintain 9.0 GPA across semester courses",
            category=GoalCategory.ACADEMIC,
            progress=0.72
        )
        g2 = Goal(
            id="g_project",
            title="Complete autonomous edge computing capstone",
            category=GoalCategory.PROJECT,
            progress=0.60
        )
        self.goals[g1.id] = g1
        self.goals[g2.id] = g2

        # Initial tasks (per user prompt seed data)
        # 1. AI Assignment (Due tomorrow, not started)
        t1 = Task(
            id="task_ai_assign",
            name="AI Assignment 3",
            description="Deep Neural Networks & Transformer attention mechanism calculations",
            deadline=datetime.utcnow() + timedelta(hours=22),
            estimated_duration_minutes=120,
            urgency=0.92,
            importance=0.90,
            goal_relevance=0.85,
            consequence=0.88,
            progress=0.0,
            status=TaskStatus.NOT_STARTED,
            marks_value=25,
            subtasks=[
                Subtask(id="st_1", title="Part 1: Multi-head self-attention derivations", estimated_minutes=25),
                Subtask(id="st_2", title="Part 2: Positional encoding implementation", estimated_minutes=30),
                Subtask(id="st_3", title="Part 3: Cross-entropy loss computation", estimated_minutes=25),
                Subtask(id="st_4", title="Part 4: PyTorch ablation experiment", estimated_minutes=25),
                Subtask(id="st_5", title="Part 5: Documentation & PDF writeup", estimated_minutes=15),
            ]
        )
        # 2. Database Assignment
        t2 = Task(
            id="task_db_assign",
            name="Database Assignment",
            description="PostgreSQL indexing & query execution plan analysis",
            deadline=datetime.utcnow() + timedelta(days=3),
            estimated_duration_minutes=90,
            urgency=0.55,
            importance=0.75,
            goal_relevance=0.70,
            consequence=0.60,
            progress=0.20,
            status=TaskStatus.IN_PROGRESS,
            marks_value=15
        )
        # 3. Capstone Project Work
        t3 = Task(
            id="task_project_work",
            name="Project Work - Edge Inference",
            description="Optimize model quantisation for Raspberry Pi 5 benchmark",
            deadline=datetime.utcnow() + timedelta(days=5),
            estimated_duration_minutes=180,
            urgency=0.60,
            importance=0.85,
            goal_relevance=0.90,
            consequence=0.75,
            progress=0.45,
            status=TaskStatus.IN_PROGRESS
        )
        self.tasks[t1.id] = t1
        self.tasks[t2.id] = t2
        self.tasks[t3.id] = t3

        # Calendar events
        self.calendar_events = [
            {"id": "cal_1", "title": "Advanced Systems Class", "start": "09:00", "end": "10:30", "type": "class"},
            {"id": "cal_2", "title": "Lab Session", "start": "11:00", "end": "12:30", "type": "lab"},
            {"id": "cal_3", "title": "Capstone Project Meeting", "start": "17:00", "end": "18:00", "type": "meeting"},
        ]

    def get_summary(self) -> Dict[str, Any]:
        return {
            "total_tasks": len(self.tasks),
            "pending_tasks": [t.dict() for t in self.tasks.values() if t.status != TaskStatus.COMPLETED],
            "calendar_events": self.calendar_events,
            "goals": [g.dict() for g in self.goals.values()],
            "user": self.user_preferences
        }
