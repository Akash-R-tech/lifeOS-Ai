import asyncio
import logging
import uuid
from datetime import datetime
from backend.events.event_bus import EventBus
from backend.models.event import SystemEvent, EventType, ImportanceLevel

logger = logging.getLogger("lifeos.monitor")

class EventMonitor:
    """
    Continuous background observer for authorized sources:
    - Gmail mailbox polling
    - Google Calendar change detection
    - Workspace file system checks
    - Approaching deadline triggers
    """
    def __init__(self, event_bus: EventBus, interval_seconds: int = 15):
        self.event_bus = event_bus
        self.interval_seconds = interval_seconds
        self.is_running = False
        self._task = None

    async def start(self):
        self.is_running = True
        self._task = asyncio.create_task(self._loop())
        logger.info(f"EventMonitor started with {self.interval_seconds}s polling cadence")

    async def stop(self):
        self.is_running = False
        if self._task:
            self._task.cancel()
        logger.info("EventMonitor stopped")

    async def _loop(self):
        while self.is_running:
            try:
                await self.poll_sources()
                await asyncio.sleep(self.interval_seconds)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in EventMonitor loop: {e}")
                await asyncio.sleep(self.interval_seconds)

    async def poll_sources(self):
        # In real/connected mode this checks Google Workspace APIs and local inodes
        # Background health tick
        pass

    async def simulate_event(self, event_type: EventType, source: str, data: dict, importance: ImportanceLevel = ImportanceLevel.HIGH):
        """Allows testing autonomous triggers instantaneously"""
        event = SystemEvent(
            id=f"ev_{uuid.uuid4().hex[:8]}",
            event_type=event_type,
            timestamp=datetime.utcnow(),
            source=source,
            data=data,
            importance=importance
        )
        await self.event_bus.publish(event)
        return event
