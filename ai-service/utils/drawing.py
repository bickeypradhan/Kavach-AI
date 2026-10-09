import cv2
import numpy as np
from typing import List, Dict, Any

def draw_detections_on_frame(
    frame: np.ndarray,
    persons: List[Dict[str, Any]],
    hazards: List[Dict[str, Any]],
    events: List[Dict[str, Any]]
) -> np.ndarray:
    annotated = frame.copy()
    h, w = annotated.shape[:2]

    # Draw persons
    for p in persons:
        x1, y1, x2, y2 = p["bbox"]
        compliant = p.get("compliant", True)
        color = (46, 204, 113) if compliant else (52, 73, 235) # Green vs Red in BGR

        # Draw tech-style bounding box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 2)
        
        # Corner brackets
        line_len = min(20, (x2 - x1) // 4, (y2 - y1) // 4)
        cv2.line(annotated, (x1, y1), (x1 + line_len, y1), color, 4)
        cv2.line(annotated, (x1, y1), (x1, y1 + line_len), color, 4)
        cv2.line(annotated, (x2, y1), (x2 - line_len, y1), color, 4)
        cv2.line(annotated, (x2, y1), (x2, y1 + line_len), color, 4)
        cv2.line(annotated, (x1, y2), (x1 + line_len, y2), color, 4)
        cv2.line(annotated, (x1, y2), (x1, y2 - line_len), color, 4)
        cv2.line(annotated, (x2, y2), (x2 - line_len, y2), color, 4)
        cv2.line(annotated, (x2, y2), (x2, y2 - line_len), color, 4)

        # Label badge
        status_text = "COMPLIANT" if compliant else f"VIOLATION: {', '.join(p.get('violations', []))}"
        badge_text = f"WORKER {int(p.get('confidence', 0.9)*100)}% | {status_text}"
        
        # Text background
        (tw, th), _ = cv2.getTextSize(badge_text, cv2.FONT_HERSHEY_SIMPLEX, 0.45, 1)
        cv2.rectangle(annotated, (x1, max(0, y1 - th - 10)), (x1 + tw + 10, y1), color, -1)
        cv2.putText(annotated, badge_text, (x1 + 5, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1, cv2.LINE_AA)

    # Draw hazards (fire / smoke)
    for h_item in hazards:
        x1, y1, x2, y2 = h_item["bbox"]
        h_type = h_item.get("type", "hazard")
        color = (0, 69, 255) if h_type == "fire" else (180, 180, 180) # Bright Orange-Red vs Gray in BGR
        
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3)
        label = f"HAZARD: {h_type.upper()} ({int(h_item.get('confidence', 0.9)*100)}%)"
        (tw, th), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
        cv2.rectangle(annotated, (x1, max(0, y1 - th - 10)), (x1 + tw + 10, y1), color, -1)
        cv2.putText(annotated, label, (x1 + 5, y1 - 5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)

    # Add HUD / Telemetry Watermark
    overlay = annotated.copy()
    cv2.rectangle(overlay, (0, 0), (w, 32), (15, 23, 42), -1)
    cv2.addWeighted(overlay, 0.75, annotated, 0.25, 0, annotated)
    
    cv2.putText(annotated, "AI SAFE-OPERATING-SYSTEM | REAL-TIME INFERENCE ACTIVE", (15, 21), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 240, 255), 1, cv2.LINE_AA)
    return annotated
