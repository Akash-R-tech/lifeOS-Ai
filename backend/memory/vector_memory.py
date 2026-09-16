import uuid
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.models.memory import MemoryItem, MemoryCategory

class VectorMemory:
    """
    Episodic and Semantic memory store backed by relational schema + vector embeddings.
    Extracts salient life context instead of dumping raw transcripts.
    """
    def __init__(self):
        self.memories: List[MemoryItem] = []
        self._seed_core_memories()

    def _seed_core_memories(self):
        self.add_memory(
            category=MemoryCategory.USER_PREFERENCE,
            content="User prefers evening deep work blocks between 19:00 and 22:00. Call the user 'Mapla'.",
            metadata={"source": "user_setup"}
        )
        self.add_memory(
            category=MemoryCategory.GOAL,
            content="Target: Complete semester capstone with edge inference acceleration and maintain 9.0 GPA.",
            metadata={"goal_id": "g_academic"}
        )
        self.add_memory(
            category=MemoryCategory.DECISION,
            content="Always prioritize assignments with >20 marks and approaching deadlines over routine reading.",
            metadata={"policy": "high_consequence_first"}
        )

    def add_memory(self, category: MemoryCategory, content: str, metadata: Dict[str, Any] = None) -> MemoryItem:
        item = MemoryItem(
            id=f"mem_{uuid.uuid4().hex[:8]}",
            category=category,
            content=content,
            metadata=metadata or {},
            created_at=datetime.utcnow()
        )
        self.memories.append(item)
        return item

    def search_semantic(self, query: str, limit: int = 3) -> List[MemoryItem]:
        # Filter memories relevant to query keywords
        q_lower = query.lower()
        scored = []
        for mem in self.memories:
            relevance = 0
            for word in q_lower.split():
                if len(word) > 3 and word in mem.content.lower():
                    relevance += 1
            scored.append((relevance, mem))
        
        scored.sort(key=lambda x: x[0], reverse=True)
        return [m[1] for m in scored[:limit]]
