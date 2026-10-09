import cv2
import numpy as np
from typing import List, Dict, Any
from detectors.base import BaseDetector
from app.config import settings

class FireDetector(BaseDetector):
    def __init__(self):
        pass

    def detect(self, frame: np.ndarray, **kwargs) -> List[Dict[str, Any]]:
        h, w = frame.shape[:2]
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        ycrcb = cv2.cvtColor(frame, cv2.COLOR_BGR2YCrCb)

        # Fire color range in HSV: Red/Orange/Yellow
        lower_fire1 = np.array([0, 120, 180])
        upper_fire1 = np.array([25, 255, 255])
        lower_fire2 = np.array([170, 120, 180])
        upper_fire2 = np.array([180, 255, 255])

        mask_hsv1 = cv2.inRange(hsv, lower_fire1, upper_fire1)
        mask_hsv2 = cv2.inRange(hsv, lower_fire2, upper_fire2)
        mask_hsv = cv2.bitwise_or(mask_hsv1, mask_hsv2)

        # Fire rules in YCrCb: Y >= Cb, Cr >= Cb, Cr > 130
        Y, Cr, Cb = cv2.split(ycrcb)
        mask_ycrcb = (Y >= Cb) & (Cr >= Cb) & (Cr > 140) & (Y > 120)
        mask_ycrcb = mask_ycrcb.astype(np.uint8) * 255

        combined_mask = cv2.bitwise_and(mask_hsv, mask_ycrcb)
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        cleaned = cv2.morphologyEx(combined_mask, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hazards = []

        min_area = (h * w) * 0.001
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > min_area:
                x, y, bw, bh = cv2.boundingRect(cnt)
                aspect_ratio = bh / float(bw)
                conf = min(0.98, max(0.60, area / (min_area * 10) * 0.4 + 0.55))
                if conf >= settings.FIRE_CONFIDENCE_THRESHOLD:
                    hazards.append({
                        "type": "fire",
                        "confidence": round(conf, 2),
                        "bbox": [x, y, x + bw, y + bh],
                        "area_ratio": round(area / (h * w), 4)
                    })
        return hazards
