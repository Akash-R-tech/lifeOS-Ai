# LifeOS AI — Autonomous Voice-First Personal Super Assistant

LifeOS is an autonomous, voice-first personal super assistant that continuously observes authorized information sources (Gmail, Google Calendar, Classroom, Local Files), understands changes, computes deterministic priority scores, takes permitted actions, verifies the results, and communicates proactively through voice.

---

## The Central Intelligence Loop

```text
INFORMATION (Gmail, Calendar, Local Files, Classroom)
    ↓
DETECT CHANGE (Event Monitor & Event Bus)
    ↓
UNDERSTAND CONTEXT (Context Engine)
    ↓
CHECK MEMORY (Vector & Structured Memory)
    ↓
DECIDE IMPORTANCE (Voice Intimation Policy)
    ↓
DECIDE WHAT TO DO (Decision Engine & Autonomous Planner)
    ↓
CHECK PERMISSION (Capability & Safety Policy Guard)
    ↓
ACT (Controlled Computer Action Executor)
    ↓
VERIFY RESULT (Action Verifier)
    ↓
UPDATE MEMORY (Memory Extraction Layer)
    ↓
VOICE INTIMATION (Text-to-Speech Proactive Speech)
```

---

## Key Features

1. **Voice-First Interaction**:
   - Primary interface is speech.
   - Natural spoken queries: *"Mapla, enna pending?"*, *"Handle the assignment."*, *"What am I forgetting?"*, *"What should I do now?"*, *"What happens if I postpone this?"*
   - Proactive voice notifications when high-importance events occur without user prompting.

2. **Deterministic Priority Engine**:
   - Computes task and event priorities using weighted factors:
     `Priority = Urgency × 0.35 + Importance × 0.30 + Goal Relevance × 0.20 + Consequence × 0.15`
   - Explains scores in natural language with confidence intervals.

3. **Autonomous Daily Planner**:
   - Continuously recalibrates the user's daily schedule as meetings shift, new assignments arrive, or tasks finish.

4. **Forgotten Work Detection**:
   - Proactively identifies unstarted tasks due soon when available time is dwindling.
   - Flags unanswered critical emails and approaching meetings missing workspaces.

5. **Assignment Autonomy**:
   - Detects assignment emails, parses requirements and deadlines, estimates effort, decomposes into subtasks, creates workspace directories, and schedules working blocks.

6. **Controlled Computer Automation**:
   - Safe execution abstractions (`OPEN_FILE`, `CREATE_FILE`, `CREATE_FOLDER`, `PREPARE_WORKSPACE`, `CREATE_TASK`, `UPDATE_SCHEDULE`, `DRAFT_ROUTINE_EMAIL`).
   - Hardcoded permission engine enforcing capabilities and preventing arbitrary shell commands.
   - Irreversible actions (deletion, financial, final academic submissions) require mandatory user confirmation.

7. **What-If Simulator**:
   - Answers impact queries: *"What happens if I postpone this to tomorrow?"* with quantifiable deadline risks, schedule conflicts, and workload projections.

---

## Python Architecture Structure

```text
backend/
├── main.py                    # FastAPI application entry & router mounts
├── config.py                  # Pydantic Settings & environment validation
├── database.py                # Async PostgreSQL & SQLite compatibility
├── agents/                    # Multi-agent reasoning system
│   ├── core_agent.py          # Central intelligence coordinator
│   ├── priority_agent.py      # Deterministic priority engine
│   ├── planner_agent.py       # Autonomous continuous daily planner
│   ├── decision_agent.py      # Event change evaluation & decision maker
│   ├── memory_agent.py        # Episodic & semantic memory extractor
│   ├── assignment_agent.py    # Academic email & document parser
│   └── computer_agent.py      # Controlled system action orchestrator
├── automation/                # Safe execution pipeline
│   ├── action_engine.py       # Action dispatcher & validation
│   ├── permission_engine.py   # Capability-based permission checker
│   ├── executor.py            # Sandboxed action executor
│   └── verifier.py            # Execution verification & post-check
├── integrations/              # External service adapters
│   ├── gmail.py               # Gmail API + OAuth & demo adapter
│   ├── calendar.py            # Google Calendar API & conflict detector
│   ├── classroom.py           # Google Classroom assignments
│   └── files.py               # Local workspace filesystem operations
├── memory/
│   └── vector_memory.py       # Vector embeddings & memory store
├── events/
│   ├── event_bus.py           # Asynchronous pub/sub event bus
│   ├── monitor.py             # Background polling & event detector
│   └── handlers.py            # Domain event handlers
├── models/                    # Pydantic & ORM schemas
├── services/                  # Business logic services
└── tests/                     # Unit & integration tests
```

---

## Quick Start

### 1. Web Prototype (Ready in Cloud Container)
The application runs full-stack on port 3000 via Express + Vite + React, with the complete Python backend code ready for local or Docker deployment.

### 2. Running the Python Backend Locally
```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

### 3. Docker Compose
```bash
docker-compose up -d
```
