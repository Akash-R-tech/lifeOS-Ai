from typing import Dict, Any, List
from backend.models.task import Task
from backend.config import settings

class PriorityAgent:
    """
    Deterministic priority scoring engine combined with reasoning explanations.
    Formula:
      Priority Score = Urgency * w_u + Importance * w_i + Goal_Relevance * w_g + Consequence * w_c
    """
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or {
            "urgency": settings.WEIGHT_URGENCY,
            "importance": settings.WEIGHT_IMPORTANCE,
            "goal_relevance": settings.WEIGHT_GOAL_RELEVANCE,
            "consequence": settings.WEIGHT_CONSEQUENCE,
        }

    def calculate_priority(self, task: Task) -> Dict[str, Any]:
        urgency = task.urgency
        importance = task.importance
        goal_relevance = task.goal_relevance
        consequence = task.consequence
        
        score = (
            urgency * self.weights["urgency"] +
            importance * self.weights["importance"] +
            goal_relevance * self.weights["goal_relevance"] +
            consequence * self.weights["consequence"]
        )
        score = round(min(1.0, max(0.0, score)), 3)
        
        reasons: List[str] = []
        if urgency >= 0.8:
            reasons.append("Deadline is imminent or within danger window")
        elif urgency >= 0.6:
            reasons.append("Approaching deadline requiring timely action")
            
        if importance >= 0.8:
            reasons.append(f"High academic/project weight{f' ({task.marks_value} marks)' if task.marks_value else ''}")
        
        if task.status == "NOT_STARTED" and urgency >= 0.5:
            reasons.append("Task has not been started yet")
            
        if task.estimated_duration_minutes > 90:
            reasons.append(f"Substantial workload (~{task.estimated_duration_minutes} minutes)")

        if not reasons:
            reasons.append("Standard routine priority alignment")

        recommendation = f"Work on {task.name}"
        if urgency >= 0.8 and task.status == "NOT_STARTED":
            recommendation = f"Immediately start {task.name} tonight"

        return {
            "priority": score,
            "recommendation": recommendation,
            "reasons": reasons,
            "confidence": 0.94,
            "breakdown": {
                "urgency_component": round(urgency * self.weights["urgency"], 3),
                "importance_component": round(importance * self.weights["importance"], 3),
                "goal_component": round(goal_relevance * self.weights["goal_relevance"], 3),
                "consequence_component": round(consequence * self.weights["consequence"], 3),
            }
        }
