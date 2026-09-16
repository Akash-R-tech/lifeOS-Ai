import pytest
from datetime import datetime, timedelta
from backend.models.task import Task, TaskStatus
from backend.agents.priority_agent import PriorityAgent

def test_deterministic_priority_calculation():
    agent = PriorityAgent()
    
    # High urgency, high importance task
    urgent_task = Task(
        id="t_urgent",
        name="AI Assignment 3",
        urgency=0.95,
        importance=0.90,
        goal_relevance=0.85,
        consequence=0.90,
        status=TaskStatus.NOT_STARTED,
        estimated_duration_minutes=120
    )
    
    res = agent.calculate_priority(urgent_task)
    expected_score = 0.95 * 0.35 + 0.90 * 0.30 + 0.85 * 0.20 + 0.90 * 0.15
    assert abs(res["priority"] - round(expected_score, 3)) < 0.001
    assert "reasons" in res
    assert len(res["reasons"]) > 0

def test_weights_respect_bounds():
    agent = PriorityAgent()
    low_task = Task(
        id="t_low",
        name="Optional Reading",
        urgency=0.1,
        importance=0.1,
        goal_relevance=0.1,
        consequence=0.1,
        status=TaskStatus.NOT_STARTED
    )
    res = agent.calculate_priority(low_task)
    assert res["priority"] <= 0.2
