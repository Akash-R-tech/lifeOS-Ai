"""
Autonomous Demo Mode Runner.
Simulates the autonomous flow:
1. Detects new assignment email
2. Extracts requirements
3. Computes priority
4. Schedules work in planner
5. Creates workspace
6. Speaks voice intimation
"""
import asyncio
from backend.services.context_service import ContextService
from backend.services.planning_service import PlanningService
from backend.agents.priority_agent import PriorityAgent
from backend.agents.decision_agent import DecisionAgent
from backend.agents.assignment_agent import AssignmentAgent
from backend.agents.core_agent import CoreAgent
from backend.automation.action_engine import ActionEngine
from backend.automation.permission_engine import PermissionEngine
from backend.memory.vector_memory import VectorMemory

async def run_demo():
    print("=== LifeOS AI: Autonomous Voice-First Demo ===")
    ctx = ContextService()
    priority = PriorityAgent()
    planner = PlanningService(ctx, priority)
    decision = DecisionAgent(ctx, planner, priority)
    perm = PermissionEngine()
    action = ActionEngine(perm)
    assign = AssignmentAgent(ctx, planner, priority, action)
    mem = VectorMemory()
    core = CoreAgent(ctx, planner, priority, decision, assign, action, perm, mem)

    print("\n[Step 1] User initiates voice query: 'Mapla, enna pending?'")
    r1 = await core.handle_voice_query("Mapla, enna pending?")
    print(f"LifeOS Voice Output:\n> \"{r1['speech']}\"")

    print("\n[Step 2] User voice command: 'Handle the assignment.'")
    r2 = await core.handle_voice_query("Handle the assignment.")
    print(f"LifeOS Voice Output:\n> \"{r2['speech']}\"")

    print("\n[Step 3] Autonomous Event Simulation: Incoming Professor Email")
    r3 = await assign.process_assignment_email({
        "subject": "AI Assignment 3: Transformers",
        "sender": "prof_ai@university.edu"
    })
    print(f"LifeOS Proactive Voice Intimation:\n> \"{r3['verbal_response']}\"")

if __name__ == "__main__":
    asyncio.run(run_demo())
