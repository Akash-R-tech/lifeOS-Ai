"""
LifeOS AI Seed Data Configuration.
Provides realistic baseline state matching prompt scenarios.
"""
from datetime import datetime, timedelta

SEED_DATA = {
    "user": {
        "name": "Mapla",
        "email": "user@university.edu"
    },
    "emails": [
        {
            "id": "em_prof_01",
            "from": "Professor Ramanathan <prof_ai@university.edu>",
            "subject": "AI Assignment 3: Transformers & Attention Mechanisms",
            "received_at": (datetime.utcnow() - timedelta(hours=1)).isoformat(),
            "deadline": (datetime.utcnow() + timedelta(hours=22)).isoformat(),
            "attachment": "assignment3_spec.pdf",
            "body": "Dear students, please find attached AI Assignment 3. The deadline is tomorrow at 11:59 PM.",
            "requires_reply": True,
            "replied": False
        }
    ],
    "calendar": [
        {"id": "cal_1", "title": "Database Systems Lecture", "start": "09:00", "end": "10:30"},
        {"id": "cal_2", "title": "Deep Learning Lab", "start": "11:00", "end": "12:30"},
        {"id": "cal_3", "title": "Capstone Project Meeting", "start": "17:00", "end": "18:00"}
    ],
    "tasks": [
        {
            "id": "task_ai_assign",
            "name": "AI Assignment 3",
            "status": "NOT_STARTED",
            "deadline": "Tomorrow 11:59 PM",
            "estimated_minutes": 120,
            "marks": 25
        },
        {
            "id": "task_db_assign",
            "name": "Database Assignment",
            "status": "IN_PROGRESS",
            "deadline": "In 3 days",
            "estimated_minutes": 90,
            "marks": 15
        },
        {
            "id": "task_project_work",
            "name": "Project Work - Edge Inference",
            "status": "IN_PROGRESS",
            "deadline": "In 5 days",
            "estimated_minutes": 180
        }
    ]
}
