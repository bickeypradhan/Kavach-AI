from datetime import datetime, timezone
from typing import List, Dict, Any
from engine.risk_engine import RiskEngine

class EventGenerator:
    def __init__(self):
        self.risk_engine = RiskEngine()

    def generate_events(
        self,
        persons: List[Dict[str, Any]],
        hazards: List[Dict[str, Any]],
        camera_id: str = "CAM-01",
        site_id: str = "SITE-01"
    ) -> List[Dict[str, Any]]:
        events = []
        now_iso = datetime.now(timezone.utc).isoformat()

        # 1. PPE Non-Compliance Events
        for p in persons:
            if not p.get("compliant", True) and p.get("violations"):
                violations = p["violations"]
                zone = p.get("zone", "Factory Floor")
                zone_id = p.get("zone_id", "zone_general")
                zone_risk = "HIGH" if "Welding" in zone or "Chemical" in zone else "MEDIUM"
                
                risk_eval = self.risk_engine.evaluate_ppe_risk(violations, zone_risk)
                
                events.append({
                    "event_type": "PPE_VIOLATION",
                    "title": f"PPE Non-Compliance: Missing {', '.join(violations)}",
                    "severity": risk_eval["severity"],
                    "description": f"Worker in {zone} is not wearing required PPE: {', '.join(violations)}.",
                    "confidence": p.get("confidence", 0.90),
                    "missing_ppe": violations,
                    "zone": zone,
                    "zone_id": zone_id,
                    "camera_id": camera_id,
                    "site_id": site_id,
                    "bbox": p["bbox"],
                    "timestamp": now_iso
                })

        # 2. Fire & Smoke Hazard Events
        for h in hazards:
            h_type = h.get("type", "hazard")
            zone = h.get("zone", "Factory Floor")
            zone_id = h.get("zone_id", "zone_general")
            conf = h.get("confidence", 0.90)
            
            risk_eval = self.risk_engine.evaluate_hazard_risk(h_type, zone, conf)
            event_type = "FIRE_DETECTED" if h_type == "fire" else "SMOKE_DETECTED"
            
            events.append({
                "event_type": event_type,
                "title": f"{'🚨 CRITICAL FIRE' if h_type == 'fire' else '⚠️ SMOKE HAZARD'} in {zone}",
                "severity": risk_eval["severity"],
                "description": risk_eval["reason"],
                "confidence": conf,
                "zone": zone,
                "zone_id": zone_id,
                "camera_id": camera_id,
                "site_id": site_id,
                "bbox": h["bbox"],
                "timestamp": now_iso
            })

        return events
