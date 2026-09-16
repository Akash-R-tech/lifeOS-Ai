from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from backend.services.context_service import ContextService
from backend.services.planning_service import PlanningService
from backend.agents.priority_agent import PriorityAgent
from backend.models.task import TaskStatus

class DecisionAgent:
    """
    Cognitive decision engine:
    - Analyzes context and detected events
    - Detects forgotten or endangered work
    - Simulates 'What-If' scenarios
    - Formulates structured action proposals
    """
    def __init__(
        self,
        context_service: ContextService,
        planning_service: PlanningService,
        priority_agent: PriorityAgent
    ):
        self.context_service = context_service
        self.planning_service = planning_service
        self.priority_agent = priority_agent

    def detect_forgotten_work(self) -> List[Dict[str, Any]]:
        alerts = []
        now = datetime.utcnow()

        # 1. Check for unstarted tasks with impending deadlines
        for task in self.context_service.tasks.values():
            if task.status == TaskStatus.NOT_STARTED and task.deadline:
                time_remaining = (task.deadline - now).total_seconds() / 3600.0
                if time_remaining <= 30.0:  # within ~30 hours
                    alerts.append({
                        "type": "UNSTARTED_IMMINENT_TASK",
                        "task_id": task.id,
                        "task_name": task.name,
                        "deadline_hours": round(time_remaining, 1),
                        "estimated_minutes": task.estimated_duration_minutes,
                        "risk_level": "HIGH",
                        "message": (
                            f"Mapla, your {task.name} is due in {round(time_remaining)} hours and hasn't been started. "
                            f"You need roughly {round(task.estimated_duration_minutes/60, 1)} hours, but only limited focus time remains tomorrow. "
                            f"I strongly recommend starting it tonight."
                        )
                    })

        # 2. Check for unanswered high-priority emails
        for email in self.context_service.emails:
            if email.get("requires_reply") and not email.get("replied"):
                alerts.append({
                    "type": "IGNORED_EMAIL",
                    "subject": email.get("subject"),
                    "sender": email.get("from"),
                    "risk_level": "MEDIUM",
                    "message": f"Mapla, Professor's email regarding '{email.get('subject')}' requires a response and has been waiting."
                })

        return alerts

    def simulate_what_if(self, query: str, task_id: Optional[str] = None, delay_hours: float = 24.0) -> Dict[str, Any]:
        """
        Simulates: 'What if I postpone this?', 'What if I skip this?'
        Computes deadline risk, schedule impact, and recovery time.
        """
        # Pick relevant task
        task = self.context_service.tasks.get(task_id or "task_ai_assign")
        if not task:
            # Fallback to top task
            task = list(self.context_service.tasks.values())[0]

        now = datetime.utcnow()
        current_deadline = task.deadline or (now + timedelta(hours=22))
        hours_before_deadline = (current_deadline - now).total_seconds() / 3600.0
        
        # If delayed by delay_hours
        remaining_after_delay = hours_before_deadline - delay_hours
        
        if remaining_after_delay <= 2.0:
            risk = "CRITICAL_FAILURE"
            recommendation = "STRICTLY_AVOID"
            verbal_explanation = (
                f"If you postpone {task.name} until tomorrow, you'll have only about "
                f"{max(15, int(remaining_after_delay * 60))} minutes free before the deadline, "
                f"while the assignment requires at least {task.estimated_duration_minutes} minutes. "
                f"I don't recommend postponing it. Let's finish the first three parts tonight."
            )
        else:
            risk = "MODERATE_RISK"
            recommendation = "FEASIBLE_WITH_COMPRESSION"
            verbal_explanation = (
                f"Postponing {task.name} will compress your tomorrow evening schedule, "
                f"leaving zero buffer for unexpected errors."
            )

        return {
            "query": query,
            "target_task": task.name,
            "delay_hours": delay_hours,
            "current_hours_to_deadline": round(hours_before_deadline, 1),
            "estimated_effort_minutes": task.estimated_duration_minutes,
            "projected_buffer_minutes": max(0, int(remaining_after_delay * 60)),
            "risk_assessment": risk,
            "recommendation": recommendation,
            "verbal_explanation": verbal_explanation,
            "recovery_possible": remaining_after_delay > 2.0
        }
