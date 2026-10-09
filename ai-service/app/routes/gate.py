"""
Real YOLO gate scan endpoint.
Model: YOLOv8n (person detection) + HSV heuristic PPE evaluation.
NOTE: yolov8n.pt detects 80 COCO classes; class 0 = person.
A purpose-trained PPE model can be swapped in by changing MODEL_PATH.
"""
import time
import json
import base64
import io
import os
import numpy as np
import cv2
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional
from PIL import Image
from huggingface_hub import hf_hub_download

router = APIRouter()

# ── Model load (once at startup) ─────────────────────────────────────────────
_model_person = None
_model_ppe = None
_model_info = {}

def get_models():
    global _model_person, _model_ppe, _model_info
    if _model_person is not None and _model_ppe is not None:
        return _model_person, _model_ppe
    try:
        from ultralytics import YOLO
        _model_person = YOLO('yolov8n.pt')  # For person detection
        
        # Load pre-trained PPE model
        ppe_weights = hf_hub_download(repo_id="keremberke/yolov8m-protective-equipment-detection", filename="best.pt")
        _model_ppe = YOLO(ppe_weights)
        
        _model_info = {
            'person_model': 'yolov8n.pt',
            'ppe_model': 'keremberke/yolov8m-protective-equipment-detection',
            'ppe_classes': list(_model_ppe.names.values()),
            'device': 'cpu'
        }
        print(f"[GATE] Models loaded. PPE Classes: {len(_model_info['ppe_classes'])}")
        return _model_person, _model_ppe
    except Exception as e:
        print(f"[GATE] Model load failed: {e}")
        return None, None

# Trigger load at import time (warm-up)
try: get_models()
except: pass


# ── HSV colour-based PPE heuristic ───────────────────────────────────────────
def _check_hsv(crop, *ranges):
    """Returns True if any of the HSV ranges covers > 6% of the crop."""
    if crop is None or crop.size == 0:
        return False
    hsv = cv2.cvtColor(crop, cv2.COLOR_BGR2HSV)
    mask = np.zeros(hsv.shape[:2], np.uint8)
    for lo, hi in ranges:
        mask = cv2.bitwise_or(mask, cv2.inRange(hsv, np.array(lo), np.array(hi)))
    ratio = np.count_nonzero(mask) / (crop.shape[0] * crop.shape[1] + 1e-5)
    return ratio > 0.06


def evaluate_ppe_on_crop(crop: np.ndarray, required: list) -> dict:
    """
    Heuristic PPE evaluation on a person crop.
    Returns dict {ppe_name: bool}
    """
    if crop is None or crop.size == 0:
        return {p: False for p in required}

    ph, pw = crop.shape[:2]
    head  = crop[0:int(ph * 0.25), :]
    torso = crop[int(ph * 0.20):int(ph * 0.65), :]
    lower = crop[int(ph * 0.65):ph, :]

    result = {}
    for ppe in required:
        p = ppe.lower()
        if p == 'helmet':
            result[ppe] = _check_hsv(head,
                ((15,80,80),(35,255,255)),   # yellow
                ((0,0,160),(180,40,255)),     # white/light
                ((100,80,80),(130,255,255)))  # blue
        elif p == 'vest':
            result[ppe] = _check_hsv(torso,
                ((10,120,120),(30,255,255)),  # orange-yellow
                ((35,100,80),(85,255,255)))   # neon green
        elif p in ('boots', 'footwear'):
            result[ppe] = _check_hsv(lower,
                ((0,0,0),(180,255,50)),       # dark/black boots
                ((0,60,60),(20,255,180)))     # brown boots
        elif p == 'gloves':
            # Gloves are harder; use side hand regions
            lh = torso[:, :int(pw*0.20)]
            rh = torso[:, int(pw*0.80):]
            result[ppe] = _check_hsv(np.hstack([lh, rh]) if lh.size and rh.size else torso,
                ((0,0,150),(180,30,255)),     # white gloves
                ((0,0,0),(180,255,60)))       # dark gloves
        elif p == 'goggles':
            # Around eye level (top 30% of head)
            eye = head[int(ph*0.05):int(ph*0.15), :]
            result[ppe] = _check_hsv(eye,
                ((0,0,0),(180,255,60)),       # dark goggles
                ((95,50,50),(135,255,255)))   # blue tinted
        elif p == 'mask':
            nose = head[int(ph*0.12):int(ph*0.25), :]
            result[ppe] = _check_hsv(nose,
                ((0,0,200),(180,30,255)),     # white mask
                ((0,0,0),(180,255,60)))       # dark mask
        elif p == 'ear_protection':
            # Side of head; hard to distinguish, default to uncertain
            result[ppe] = False
        else:
            result[ppe] = False
    return result


def evaluate_ppe_with_yolo(crop: np.ndarray, required: list, ppe_model, conf_thresh=0.25):
    """
    Run YOLO PPE detection on the person crop.
    Map keremberke classes to our required PPE names.
    keremberke classes: 0: 'glove', 1: 'goggles', 2: 'helmet', 3: 'mask', 4: 'no_glove', 5: 'no_goggles', 6: 'no_helmet', 7: 'no_mask', 8: 'no_shoes', 9: 'shoes'
    """
    result = {p: False for p in required}
    if crop is None or crop.size == 0 or ppe_model is None:
        return result, []
    
    # Run PPE model on the crop
    res = ppe_model(crop, verbose=False, conf=conf_thresh)
    
    raw_detections = []
    
    for r in res:
        for box in r.boxes:
            cls_id = int(box.cls[0])
            conf = float(box.conf[0])
            cls_name = ppe_model.names[cls_id]
            raw_detections.append(f"{cls_name} {conf:.2f}")
            
            # Map to our standard names
            std_name = None
            if cls_name == 'helmet': std_name = 'helmet'
            elif cls_name == 'shoes': std_name = 'boots'  # Map shoes to boots
            elif cls_name == 'glove': std_name = 'gloves'
            elif cls_name == 'goggles': std_name = 'goggles'
            elif cls_name == 'mask': std_name = 'mask'
            
            # Note: We do not check 'vest' as the model doesn't explicitly detect it as 'vest' (it has no_safety_vest but let's assume if it had vest it would be there. Wait, keremberke has no safety vest. If vest is required, we fallback to HSV or just say not supported by this model. For now, HSV fallback for vest).
            if std_name and std_name in required:
                result[std_name] = True
                
    # Optional HSV fallback for vest (since keremberke model doesn't have positive vest class in its 10 classes)
    if 'vest' in required and not result.get('vest'):
        ph, pw = crop.shape[:2]
        torso = crop[int(ph * 0.20):int(ph * 0.65), :]
        if _check_hsv(torso, ((10,120,120),(30,255,255)), ((35,100,80),(85,255,255))):
            result['vest'] = True
            raw_detections.append("vest (HSV fallback) 1.00")

    print("[GATE] Raw PPE Detections on crop:", ", ".join(raw_detections))
    return result, raw_detections

# ── YOLO person detection + PPE evaluation ───────────────────────────────────
def detect_ppe_in_frame(frame: np.ndarray, required: list, conf_thresh: float = 0.35):
    """
    Run YOLO person detection.
    For each detected person, run YOLO PPE model on their crop.
    Returns: (persons_list, annotated_frame_b64, inference_ms)
    """
    person_model, ppe_model = get_models()
    t0 = time.time()
    persons = []

    if person_model is not None:
        try:
            results = person_model(frame, classes=[0], verbose=False, conf=conf_thresh)
            for r in results:
                for box in r.boxes:
                    x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
                    conf = float(box.conf[0])
                    h, w = frame.shape[:2]
                    crop = frame[max(0,y1):min(h,y2), max(0,x1):min(w,x2)]
                    
                    ppe_status, raw_det = evaluate_ppe_with_yolo(crop, required, ppe_model)
                    detected_ppe = [k for k, v in ppe_status.items() if v]
                    missing_ppe  = [k for k in required if not ppe_status.get(k, False)]
                    
                    persons.append({
                        'bbox': [x1,y1,x2,y2], 'confidence': round(conf,3),
                        'ppe_status': ppe_status,
                        'detected_ppe': detected_ppe,
                        'missing_ppe': missing_ppe,
                        'raw_detections': raw_det,
                        'compliant': len(missing_ppe) == 0,
                        'is_simulated': False,
                    })
        except Exception as e:
            print(f"[GATE] YOLO error: {e}")

    if not persons:
        # Simulation fallback (clearly labelled)
        persons = [{
            'bbox': [0,0,0,0], 'confidence': 0.0,
            'ppe_status': {p: False for p in required},
            'detected_ppe': [], 'missing_ppe': list(required),
            'raw_detections': [],
            'compliant': len(required) == 0, 'is_simulated': True,
        }]

    inf_ms = round((time.time() - t0) * 1000)

    # Annotate frame
    ann = frame.copy()
    for p in persons:
        x1,y1,x2,y2 = p['bbox']
        if x2 > x1 and y2 > y1:
            color = (0,200,0) if p['compliant'] else (0,60,255)
            cv2.rectangle(ann, (x1,y1), (x2,y2), color, 2)
            label = 'COMPLIANT' if p['compliant'] else f"MISSING: {','.join(p['missing_ppe'])}"
            cv2.putText(ann, label, (x1, max(y1-8,10)), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 1)

    # Encode annotated frame
    _, buf = cv2.imencode('.jpg', ann, [cv2.IMWRITE_JPEG_QUALITY, 75])
    b64 = base64.b64encode(buf.tobytes()).decode()

    return persons, b64, inf_ms


# ── Endpoint ──────────────────────────────────────────────────────────────────
@router.post("/gate/scan")
async def gate_scan(
    file: UploadFile = File(...),
    required_ppe: Optional[str] = Form(None),
    employee_id:  Optional[str] = Form(""),
    gate_id:      Optional[str] = Form("gate-1"),
):
    try:
        # Decode image
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image — cannot decode frame")

        # Parse required PPE list
        required = []
        if required_ppe:
            try: required = json.loads(required_ppe)
            except: required = [r.strip() for r in required_ppe.split(',') if r.strip()]

        # Run detection
        persons, evidence_b64, inf_ms = detect_ppe_in_frame(frame, required)

        # Primary person (highest confidence)
        primary = max(persons, key=lambda p: p['confidence']) if persons else None

        if not primary or (primary['confidence'] == 0.0 and primary['is_simulated'] and len(persons) == 1):
            return {
                'person_detected': False,
                'decision': 'AWAITING',
                'message': 'No person detected. Please stand in front of the camera.',
                'detected_ppe': [],
                'missing_ppe': required,
                'required_ppe': required,
                'confidence': 0.0,
                'is_simulated': True,
                'evidence_image': evidence_b64,
                'model_info': _model_info,
                'inference_ms': inf_ms,
                'employee_id': employee_id,
            }

        decision = 'ALLOW' if not primary['missing_ppe'] else 'HOLD'
        return {
            'person_detected': True,
            'decision': decision,
            'message': f"Missing: {', '.join(primary['missing_ppe'])}" if primary['missing_ppe'] else 'All PPE detected.',
            'detected_ppe': primary['detected_ppe'],
            'missing_ppe': primary['missing_ppe'],
            'raw_detections': primary['raw_detections'],
            'required_ppe': required,
            'confidence': primary['confidence'],
            'bbox': primary['bbox'],
            'is_simulated': primary['is_simulated'],
            'evidence_image': evidence_b64,
            'model_info': _model_info,
            'inference_ms': inf_ms,
            'employee_id': employee_id,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/gate/model-info")
async def model_info():
    get_models()
    return _model_info
