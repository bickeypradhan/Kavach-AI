import time
from typing import Dict, Any
from app.config import settings

class DedupEngine:
    def __init__(self, cooldown_seconds: int = None):
        self.cooldown_seconds = cooldown_seconds or settings.EVENT_COOLDOWN_SECONDS
        self.recent_events: Dict[str, float] = {}

    def should_record_event(self, event: Dict[str, Any]) -> bool:
        event_key = f"{event.get('event_type')}:{event.get('zone', 'unknown')}:{event.get('camera_id', 'unknown')}"
        now = time.time()
        last_seen = self.recent_events.get(event_key, 0)

        if now - last_seen > self.cooldown_seconds:
            self.recent_events[event_key] = now
            return True
        return False
