from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional

from backend.config import settings
from backend.services.context_service import ContextService
from backend.services.planning_service import PlanningService
from backend.agents.priority_agent import PriorityAgent
from backend.agents.decision_agent import DecisionAgent
from backend.agents.assignment_agent import AssignmentAgent
from backend.agents.core_agent import CoreAgent
from backend.automation.action_engine import ActionEngine
from backend.automation.permission_engine import PermissionEngine
from backend.memory.vector_memory import VectorMemory
from backend.events.event_bus import EventBus
from backend.events.monitor import EventMonitor
from backend.models.event import SystemEvent, EventType, ImportanceLevel
from backend.models.action import ActionType, Capability
from backend.models.task import Task

app = FastAPI(title="LifeOS AI Backend", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate Core System Components
context_svc = ContextService()
priority_agent = PriorityAgent()
planner_svc = PlanningService(context_svc, priority_agent)
decision_agent = DecisionAgent(context_svc, planner_svc, priority_agent)
permission_engine = PermissionEngine()
action_engine = ActionEngine(permission_engine)
assignment_agent = AssignmentAgent(context_svc, planner_svc, priority_agent, action_engine)
memory_store = VectorMemory()
event_bus = EventBus()
event_monitor = EventMonitor(event_bus)

core_agent = CoreAgent(
    context_service=context_svc,
    planning_service=planner_svc,
    priority_agent=priority_agent,
    decision_agent=decision_agent,
    assignment_agent=assignment_agent,
    action_engine=action_engine,
    permission_engine=permission_engine,
    memory=memory_store
)

# Request Models
class VoiceQueryRequest(BaseModel):
    query: str
    voice_input: Optional[bool] = True

class ActionExecuteRequest(BaseModel):
    trigger: str
    action: ActionType
    target: str
    payload: Optional[Dict[str, Any]] = None

class WhatIfRequest(BaseModel):
    query: str
    task_id: Optional[str] = None
    delay_hours: Optional[float] = 24.0

class SimulateEventRequest(BaseModel):
    event_type: EventType
    source: str = "simulation"
    data: Optional[Dict[str, Any]] = None
    importance: Optional[ImportanceLevel] = ImportanceLevel.HIGH

# Endpoints
@app.get("/api/health")
async def health():
    return {"status": "ok", "system": "LifeOS AI", "mode": "AUTONOMOUS_VOICE_SUPER_ASSISTANT"}

@app.post("/api/voice/transcribe")
async def transcribe(data: Dict[str, Any]):
    return {"transcript": data.get("text", "Mapla, enna pending?"), "confidence": 0.99}

@app.post("/api/voice/respond")
@app.post("/api/chat")
async def handle_voice_respond(req: VoiceQueryRequest):
    return await core_agent.handle_voice_query(req.query)

@app.get("/api/tasks")
async def get_tasks():
    return [t.dict() for t in context_svc.tasks.values()]

@app.post("/api/tasks")
async def create_task(task: Task):
    context_svc.tasks[task.id] = task
    planner_svc.recalculate_plan()
    return task

@app.get("/api/goals")
async def get_goals():
    return [g.dict() for g in context_svc.goals.values()]

@app.get("/api/today")
async def get_today():
    return {
        "plan": planner_svc.get_plan(),
        "calendar": context_svc.calendar_events,
        "forgotten_work": decision_agent.detect_forgotten_work(),
        "pending_count": len([t for t in context_svc.tasks.values() if t.status != "COMPLETED"])
    }

@app.get("/api/notifications")
async def get_notifications():
    return decision_agent.detect_forgotten_work()

@app.get("/api/permissions")
async def get_permissions():
    return {
        "granted_capabilities": [c.value for c in permission_engine.granted_capabilities],
        "emergency_stop_active": permission_engine.emergency_stop_active
    }

@app.post("/api/permissions")
async def update_permissions(payload: Dict[str, Any]):
    if "emergency_stop" in payload:
        permission_engine.set_emergency_stop(bool(payload["emergency_stop"]))
    if "grant" in payload:
        permission_engine.grant_capability(Capability(payload["grant"]))
    if "revoke" in payload:
        permission_engine.revoke_capability(Capability(payload["revoke"]))
    return {"status": "UPDATED", "granted": [c.value for c in permission_engine.granted_capabilities]}

@app.post("/api/actions/execute")
async def execute_action(req: ActionExecuteRequest):
    return await action_engine.execute_action(req.trigger, req.action, req.target, req.payload)

@app.get("/api/actions/history")
async def get_action_history():
    return [log.dict() for log in action_engine.get_history()]

@app.post("/api/email/analyze")
@app.post("/api/assignment/analyze")
async def analyze_assignment(payload: Dict[str, Any]):
    return await assignment_agent.process_assignment_email(payload)

@app.post("/api/decision")
async def compute_decision():
    return {
        "forgotten": decision_agent.detect_forgotten_work(),
        "plan": planner_svc.get_plan()
    }

@app.post("/api/plan")
async def recalculate_plan():
    return planner_svc.recalculate_plan()

@app.post("/api/what-if")
async def run_what_if(req: WhatIfRequest):
    return decision_agent.simulate_what_if(req.query, req.task_id, req.delay_hours)

@app.get("/api/events")
async def get_events():
    return [e.dict() for e in event_bus.history]

@app.post("/api/events")
async def trigger_event(req: SimulateEventRequest):
    event = await event_monitor.simulate_event(
        event_type=req.event_type,
        source=req.source,
        data=req.data or {},
        importance=req.importance
    )
    # If it's a new email or assignment, trigger assignment flow automatically
    res = None
    if req.event_type in [EventType.NEW_EMAIL, EventType.NEW_ASSIGNMENT]:
        res = await assignment_agent.process_assignment_email(req.data or {
            "subject": "AI Assignment 3 - Advanced Optimization",
            "from": "Professor Ramanathan",
            "deadline": "Tomorrow 11:59 PM"
        })
    return {"event": event.dict(), "processed_result": res}
