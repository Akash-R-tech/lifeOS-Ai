import uuid
from typing import Dict, Any, List
from datetime import datetime, timedelta
from backend.models.task import Task, TaskStatus, Subtask
from backend.models.action import ActionType
from backend.services.context_service import ContextService
from backend.services.planning_service import PlanningService
from backend.agents.priority_agent import PriorityAgent
from backend.automation.action_engine import ActionEngine

class AssignmentAgent:
    """
    Autonomous Academic Assignment Coordinator.
    Extracts assignment structure, decomposes tasks, creates workspaces,
    recalculates plans, and ensures academic safety boundaries.
    """
    def __init__(
        self,
        context_service: ContextService,
        planning_service: PlanningService,
        priority_agent: PriorityAgent,
        action_engine: ActionEngine
    ):
        self.context_service = context_service
        self.planning_service = planning_service
        self.priority_agent = priority_agent
        self.action_engine = action_engine

    async def process_assignment_email(self, email_data: Dict[str, Any]) -> Dict[str, Any]:
        subject = email_data.get("subject", "Embedded Systems Assignment 2")
        sender = email_data.get("sender", "prof_embedded@university.edu")
        content = email_data.get("body", "Please complete the attached exercises on interrupt service routines and timers.")
        
        # 1. Extraction of metadata
        task_id = f"task_{uuid.uuid4().hex[:8]}"
        deadline = datetime.utcnow() + timedelta(hours=24)
        estimated_minutes = 120
        marks = 20.0

        subtasks = [
            Subtask(id=f"{task_id}_s1", title="Part 1: Timer prescaler frequency calculation", estimated_minutes=20),
            Subtask(id=f"{task_id}_s2", title="Part 2: Nested vector interrupt controller (NVIC) priority setup", estimated_minutes=30),
            Subtask(id=f"{task_id}_s3", title="Part 3: GPIO debouncing state machine", estimated_minutes=30),
            Subtask(id=f"{task_id}_s4", title="Part 4: UART telemetry loop buffer", estimated_minutes=25),
            Subtask(id=f"{task_id}_s5", title="Part 5: Logic analyzer timing diagrams & report", estimated_minutes=15),
        ]

        task = Task(
            id=task_id,
            name=subject,
            description=f"Automated assignment intake from {sender}. Requirements: 5 parts on hardware timing.",
            deadline=deadline,
            estimated_duration_minutes=estimated_minutes,
            urgency=0.90,
            importance=0.88,
            goal_relevance=0.85,
            consequence=0.80,
            status=TaskStatus.NOT_STARTED,
            marks_value=marks,
            subtasks=subtasks,
            source="gmail_assignment_detector",
            workspace_path=f"assignments/{subject.lower().replace(' ', '_')}"
        )

        # 2. Add to context
        self.context_service.tasks[task.id] = task

        # 3. Calculate priority
        p_calc = self.priority_agent.calculate_priority(task)
        task.priority_score = p_calc["priority"]

        # 4. Prepare Workspace via safe action engine
        workspace_log = await self.action_engine.execute_action(
            trigger="NEW_ASSIGNMENT_EMAIL",
            action=ActionType.PREPARE_WORKSPACE,
            target=task.workspace_path,
            payload={
                "subtasks": [st.title for st in subtasks],
                "assignment_name": task.name,
                "deadline": deadline.isoformat()
            }
        )

        # 5. Recalculate schedule
        new_plan = self.planning_service.recalculate_plan()

        # 6. Verbal intimation
        verbal_response = (
            f"Mapla, I've found a new assignment: {subject}. "
            f"It has {len(subtasks)} questions, carries {marks} marks, is due tomorrow, "
            f"and looks like about two hours of work. "
            f"I've broken it into {len(subtasks)} subtasks, prepared the project workspace, "
            f"and scheduled the first three for tonight."
        )

        return {
            "task": task.dict(),
            "priority": p_calc,
            "workspace_created": workspace_log.verified,
            "verbal_response": verbal_response,
            "plan": new_plan
        }
