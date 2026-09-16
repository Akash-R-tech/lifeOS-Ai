import asyncio
import logging
from typing import Callable, List, Dict, Any
from backend.models.event import SystemEvent, EventType, ImportanceLevel

logger = logging.getLogger("lifeos.event_bus")

class EventBus:
    """
    Central event broker. Dispatches system events through the intelligence pipeline.
    """
    def __init__(self):
        self.subscribers: Dict[EventType, List[Callable]] = {}
        self.global_subscribers: List[Callable] = []
        self.history: List[SystemEvent] = []

    def subscribe(self, event_type: EventType, handler: Callable):
        if event_type not in self.subscribers:
            self.subscribers[event_type] = []
        self.subscribers[event_type].append(handler)

    def subscribe_all(self, handler: Callable):
        self.global_subscribers.append(handler)

    async def publish(self, event: SystemEvent):
        logger.info(f"Publishing event [{event.event_type.value}] from {event.source}")
        self.history.append(event)
        
        # Specific handlers
        handlers = self.subscribers.get(event.event_type, [])
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event)
                else:
                    handler(event)
            except Exception as e:
                logger.error(f"Handler error on {event.event_type}: {e}")

        # Global handlers
        for g_handler in self.global_subscribers:
            try:
                if asyncio.iscoroutinefunction(g_handler):
                    await g_handler(event)
                else:
                    g_handler(event)
            except Exception as e:
                logger.error(f"Global handler error: {e}")
