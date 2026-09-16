import logging
from typing import Dict, Any, List
from backend.services.context_service import ContextService
from backend.services.planning_service import PlanningService
from backend.agents.priority_agent import PriorityAgent
from backend.agents.decision_agent import DecisionAgent
from backend.agents.assignment_agent import AssignmentAgent
from backend.automation.action_engine import ActionEngine
from backend.automation.permission_engine import PermissionEngine
from backend.memory.vector_memory import VectorMemory
from backend.models.action import ActionType
from backend.models.memory import MemoryCategory

logger = logging.getLogger("lifeos.core_agent")

class CoreAgent:
    """
    Central Orchestrator implementing the full intelligence loop:
    INFORMATION -> DETECT CHANGE -> UNDERSTAND CONTEXT -> CHECK MEMORY ->
    DECIDE IMPORTANCE -> DECIDE WHAT TO DO -> CHECK PERMISSION -> ACT ->
    VERIFY RESULT -> UPDATE MEMORY -> VOICE INTIMATION
    """
    def __init__(
        self,
        context_service: ContextService,
        planning_service: PlanningService,
        priority_agent: PriorityAgent,
        decision_agent: DecisionAgent,
        assignment_agent: AssignmentAgent,
        action_engine: ActionEngine,
        permission_engine: PermissionEngine,
        memory: VectorMemory
    ):
        self.context = context_service
        self.planner = planning_service
        self.priority = priority_agent
        self.decision = decision_agent
        self.assignment = assignment_agent
        self.action = action_engine
        self.permissions = permission_engine
        self.memory = memory

    async def handle_voice_query(self, query: str) -> Dict[str, Any]:
        q = query.lower().strip()
        logger.info(f"LifeOS CoreAgent processing voice command: '{query}'")

        # 1. "Mapla, enna pending?" or "What is pending?"
        if "pending" in q or "enna pending" in q or "what do i have" in q:
            pending = [t for t in self.context.tasks.values() if t.status != "COMPLETED"]
            top_task = sorted(pending, key=lambda x: self.priority.calculate_priority(x)["priority"], reverse=True)[0]
            
            speech = (
                f"Mapla, you have {len(pending)} pending tasks. "
                f"Your {top_task.name} is the highest priority because it's due tomorrow and hasn't been started. "
                f"You also have a project meeting at 5 PM."
            )
            return {
                "intent": "QUERY_PENDING_TASKS",
                "speech": speech,
                "data": {
                    "count": len(pending),
                    "top_task": top_task.dict(),
                    "calendar_meetings": self.context.calendar_events
                }
            }

        # 2. "Handle the assignment" or "Start working on my assignment"
        elif "handle the assignment" in q or "handle assignment" in q or "start working on my assignment" in q:
            target_task = self.context.tasks.get("task_ai_assign") or list(self.context.tasks.values())[0]
            
            # Execute Workspace Preparation
            ws_log = await self.action.execute_action(
                trigger="VOICE_COMMAND_HANDLE_ASSIGNMENT",
                action=ActionType.PREPARE_WORKSPACE,
                target=f"workspaces/{target_task.name.lower().replace(' ', '_')}",
                payload={"subtasks": [st.title for st in target_task.subtasks]}
            )
            
            # Update memory
            self.memory.add_memory(
                category=MemoryCategory.WORK_PROGRESS,
                content=f"Prepared workspace for {target_task.name}. Decomposed into {len(target_task.subtasks)} subtasks.",
                metadata={"task_id": target_task.id}
            )

            speech = (
                f"I've prepared the assignment workspace and broken the work into {len(target_task.subtasks)} parts. "
                f"You have enough time to finish it tonight if we start now."
            )
            return {
                "intent": "HANDLE_ASSIGNMENT",
                "speech": speech,
                "action_performed": ws_log.dict(),
                "task": target_task.dict()
            }

        # 3. "What am I forgetting?"
        elif "forgetting" in q or "forgot" in q or "missed" in q:
            forgotten = self.decision.detect_forgotten_work()
            if forgotten:
                speech = forgotten[0]["message"]
            else:
                speech = "Mapla, your current commitments and assignments are tracked. Nothing is critically neglected right now."
            return {
                "intent": "CHECK_FORGOTTEN_WORK",
                "speech": speech,
                "forgotten_alerts": forgotten
            }

        # 4. "What should I do now?" or "What should I prioritize?"
        elif "do now" in q or "prioritize" in q or "next step" in q:
            plan = self.planner.get_plan()
            planned_tasks = [p for p in plan if p.get("type") == "PLANNED_TASK"]
            if planned_tasks:
                speech = f"Mapla, right now your focus block should be on {planned_tasks[0]['title']}. Let's knock out the first subtask."
            else:
                speech = "Mapla, your calendar is clear for the next hour. I suggest opening your AI assignment."
            return {
                "intent": "RECOMMEND_NEXT_ACTION",
                "speech": speech,
                "current_plan": plan
            }

        # 5. "What happens if I postpone this?"
        elif "postpone" in q or "what if" in q or "delay" in q:
            sim = self.decision.simulate_what_if(query=query)
            return {
                "intent": "WHAT_IF_SIMULATION",
                "speech": sim["verbal_explanation"],
                "simulation": sim
            }

        # 6. "Tell my professor I'll submit tonight"
        elif "tell my professor" in q or "email professor" in q or "submit tonight" in q:
            # Safe automated routine draft
            draft_log = await self.action.execute_action(
                trigger="USER_VOICE_COMMAND",
                action=ActionType.DRAFT_ROUTINE_EMAIL,
                target="prof_advisor@university.edu",
                payload={
                    "subject": "AI Assignment 3 - Submission Update",
                    "body": "Respected Professor, I am working on the assignment solutions and will be submitting tonight before 11:59 PM. Thank you."
                }
            )
            speech = "I've drafted an email to your professor confirming your submission tonight and saved it to your drafts for one-touch dispatch."
            return {
                "intent": "COMMUNICATION_DRAFT",
                "speech": speech,
                "action": draft_log.dict()
            }

        # Default fallback
        speech = "Mapla, I'm monitoring your emails, calendar, and assignments. What would you like to check or execute?"
        return {
            "intent": "GENERAL_VOICE_ASSISTANCE",
            "speech": speech,
            "query": query
        }
