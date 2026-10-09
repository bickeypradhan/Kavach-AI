import cv2
import numpy as np
from typing import Dict, Any, List, Optional
from detectors.ppe_detector import PPEDetector
from detectors.fire_detector import FireDetector
from detectors.smoke_detector import SmokeDetector
from pipelines.zone_engine import ZoneEngine
from engine.risk_engine import RiskEngine
from engine.event_generator import EventGenerator
from utils.drawing import draw_detections_on_frame
from utils.image_utils import frame_to_base64

class FrameProcessor:
    def __init__(self):
        self.ppe_detector = PPEDetector()
        self.fire_detector = FireDetector()
        self.smoke_detector = SmokeDetector()
        self.zone_engine = ZoneEngine()
        self.risk_engine = RiskEngine()
        self.event_generator = EventGenerator()

    def process_frame(
        self,
        frame: np.ndarray,
        zone_rules: Optional[List[str]] = None,
        camera_id: str = "CAM-01",
        site_id: str = "SITE-01"
    ) -> Dict[str, Any]:
        # 1. Run detectors
        persons = self.ppe_detector.detect(frame, zone_rules=zone_rules)
        fire_hazards = self.fire_detector.detect(frame)
        smoke_hazards = self.smoke_detector.detect(frame)

        # 2. Enrich persons with Zone mapping & Compliance
        for p in persons:
            zone_info = self.zone_engine.map_bbox_to_zone(p["bbox"], frame.shape)
            p["zone"] = zone_info["zone_name"]
            p["zone_id"] = zone_info["zone_id"]
            required = zone_rules or zone_info["required_ppe"]
            compliant, violations = self.zone_engine.check_compliance(p["ppe_status"], required)
            p["compliant"] = compliant
            p["violations"] = violations

        # 3. Enrich hazards with Zone mapping
        all_hazards = []
        for f in fire_hazards:
            zone_info = self.zone_engine.map_bbox_to_zone(f["bbox"], frame.shape)
            f["zone"] = zone_info["zone_name"]
            f["zone_id"] = zone_info["zone_id"]
            all_hazards.append(f)

        for s in smoke_hazards:
            zone_info = self.zone_engine.map_bbox_to_zone(s["bbox"], frame.shape)
            s["zone"] = zone_info["zone_name"]
            s["zone_id"] = zone_info["zone_id"]
            all_hazards.append(s)

        # 4. Generate structured events
        events = self.event_generator.generate_events(
            persons=persons,
            hazards=all_hazards,
            camera_id=camera_id,
            site_id=site_id
        )

        # 5. Draw evidence bounding boxes & annotations
        annotated_frame = draw_detections_on_frame(frame, persons, all_hazards, events)
        evidence_b64 = frame_to_base64(annotated_frame)

        # 6. Compute frame summary
        total_p = len(persons)
        violating_p = sum(1 for p in persons if not p.get("compliant", True))
        comp_rate = round(((total_p - violating_p) / total_p * 100.0), 1) if total_p > 0 else 100.0

        return {
            "detections": persons,
            "hazards": all_hazards,
            "events": events,
            "evidence_image": evidence_b64,
            "frame_summary": {
                "persons_detected": total_p,
                "violations": violating_p,
                "hazards": len(all_hazards),
                "compliance_rate": comp_rate
            }
        }
