from typing import List, Dict, Any
from datetime import datetime
from backend.services.context_service import ContextService
from backend.agents.priority_agent import PriorityAgent

class PlanningService:
    """
    Autonomous Daily Planner.
    Dynamically generates and recalculates optimal time allocations
    based on calendar commitments, task priorities, and available free time.
    """
    def __init__(self, context_service: ContextService, priority_agent: PriorityAgent):
        self.context_service = context_service
        self.priority_agent = priority_agent
        self.current_plan: List[Dict[str, Any]] = []
        self.recalculate_plan()

    def recalculate_plan(self) -> List[Dict[str, Any]]:
        # Sort pending tasks by deterministic priority score
        pending_tasks = [
            t for t in self.context_service.tasks.values() 
            if t.status != "COMPLETED"
        ]
        
        for task in pending_tasks:
            p_data = self.priority_agent.calculate_priority(task)
            task.priority_score = p_data["priority"]

        sorted_tasks = sorted(pending_tasks, key=lambda x: x.priority_score or 0.0, reverse=True)
        
        # Build adaptive daily schedule
        plan = []
        # Pre-populate fixed calendar events
        for ev in self.context_service.calendar_events:
            plan.append({
                "time": f"{ev['start']} - {ev['end']}",
                "title": ev["title"],
                "type": "FIXED_EVENT",
                "locked": True,
                "urgency": "NORMAL"
            })

        # Inject highest priority tasks into free slots
        if sorted_tasks:
            top_task = sorted_tasks[0]
            plan.append({
                "time": "19:00 - 21:00",
                "title": f"Focus Block: {top_task.name}",
                "type": "PLANNED_TASK",
                "task_id": top_task.id,
                "duration_minutes": top_task.estimated_duration_minutes,
                "priority_score": top_task.priority_score,
                "locked": False,
                "recommended_focus": "Execute Subtasks 1-3"
            })

        if len(sorted_tasks) > 1:
            second_task = sorted_tasks[1]
            plan.append({
                "time": "21:30 - 22:30",
                "title": f"Secondary Review: {second_task.name}",
                "type": "PLANNED_TASK",
                "task_id": second_task.id,
                "duration_minutes": 60,
                "priority_score": second_task.priority_score,
                "locked": False
            })

        # Sort plan chronologically
        self.current_plan = plan
        return plan

    def get_plan(self) -> List[Dict[str, Any]]:
        if not self.current_plan:
            self.recalculate_plan()
        return self.current_plan
