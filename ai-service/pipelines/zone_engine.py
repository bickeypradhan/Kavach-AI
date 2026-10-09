import cv2
import numpy as np
from typing import List, Dict, Any, Optional

class ZoneEngine:
    def __init__(self):
        # Default zone polygons in normalized coordinates [0.0 - 1.0]
        self.default_zones = {
            "Welding Area": {
                "id": "zone_welding",
                "risk_level": "HIGH",
                "required_ppe": ["helmet", "vest", "gloves"],
                "polygon": [[0.0, 0.0], [0.5, 0.0], [0.5, 0.5], [0.0, 0.5]]
            },
            "Assembly Line A": {
                "id": "zone_assembly",
                "risk_level": "MEDIUM",
                "required_ppe": ["helmet", "vest"],
                "polygon": [[0.5, 0.0], [1.0, 0.0], [1.0, 0.5], [0.5, 0.5]]
            },
            "Chemical Storage": {
                "id": "zone_chem",
                "risk_level": "CRITICAL",
                "required_ppe": ["helmet", "vest", "gloves", "footwear"],
                "polygon": [[0.0, 0.5], [0.5, 0.5], [0.5, 1.0], [0.0, 1.0]]
            },
            "Warehouse": {
                "id": "zone_warehouse",
                "risk_level": "LOW",
                "required_ppe": ["helmet", "vest"],
                "polygon": [[0.5, 0.5], [1.0, 0.5], [1.0, 1.0], [0.5, 1.0]]
            }
        }

    def map_bbox_to_zone(self, bbox: List[int], frame_shape: tuple, custom_zones: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        h, w = frame_shape[:2]
        x1, y1, x2, y2 = bbox
        center_x = (x1 + x2) / 2.0 / w
        center_y = (y1 + y2) / 2.0 / h

        zones_to_check = custom_zones or self.default_zones
        for zone_name, zone_data in zones_to_check.items():
            poly = np.array(zone_data.get("polygon", [[0, 0], [1, 0], [1, 1], [0, 1]]), dtype=np.float32)
            # Point in polygon check
            dist = cv2.pointPolygonTest(poly, (center_x, center_y), False)
            if dist >= 0:
                return {
                    "zone_name": zone_name,
                    "zone_id": zone_data.get("id"),
                    "risk_level": zone_data.get("risk_level", "MEDIUM"),
                    "required_ppe": zone_data.get("required_ppe", ["helmet", "vest"])
                }

        # Fallback zone
        return {
            "zone_name": "General Production Floor",
            "zone_id": "zone_general",
            "risk_level": "MEDIUM",
            "required_ppe": ["helmet", "vest"]
        }

    def check_compliance(self, ppe_status: Dict[str, bool], required_ppe: List[str]) -> tuple[bool, List[str]]:
        violations = []
        for req in required_ppe:
            if not ppe_status.get(req, False):
                violations.append(req)
        return (len(violations) == 0, violations)
