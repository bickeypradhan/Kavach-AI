import cv2
import numpy as np
from typing import List, Dict, Any
from detectors.base import BaseDetector
from app.config import settings

class SmokeDetector(BaseDetector):
    def __init__(self):
        pass

    def detect(self, frame: np.ndarray, **kwargs) -> List[Dict[str, Any]]:
        h, w = frame.shape[:2]
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

        # Smoke characteristic: Low saturation, medium-to-high brightness (grayish haze)
        H, S, V = cv2.split(hsv)
        smoke_mask = (S < 45) & (V > 100) & (V < 235)
        smoke_mask = smoke_mask.astype(np.uint8) * 255

        # Texture gradient check - smoke has soft gradients (low standard deviation locally)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        blur_mask = np.abs(laplacian) < 15
        blur_mask = blur_mask.astype(np.uint8) * 255

        candidate = cv2.bitwise_and(smoke_mask, blur_mask)
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11))
        cleaned = cv2.morphologyEx(candidate, cv2.MORPH_OPEN, kernel)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_CLOSE, kernel)

        contours, _ = cv2.findContours(cleaned, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        hazards = []

        min_smoke_area = (h * w) * 0.015
        for cnt in contours:
            area = cv2.contourArea(cnt)
            if area > min_smoke_area:
                x, y, bw, bh = cv2.boundingRect(cnt)
                conf = min(0.95, max(0.50, (area / (min_smoke_area * 5)) * 0.3 + 0.50))
                if conf >= settings.SMOKE_CONFIDENCE_THRESHOLD:
                    hazards.append({
                        "type": "smoke",
                        "confidence": round(conf, 2),
                        "bbox": [x, y, x + bw, y + bh],
                        "area_ratio": round(area / (h * w), 4)
                    })
        return hazards
