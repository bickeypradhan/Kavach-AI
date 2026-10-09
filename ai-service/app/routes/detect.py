import io
import json
import numpy as np
import cv2
import tempfile
import os
from fastapi import APIRouter, File, UploadFile, Form, HTTPException
from typing import Optional, List
from PIL import Image

from pipelines.frame_processor import FrameProcessor
from pipelines.video_pipeline import VideoPipeline

router = APIRouter()
processor = FrameProcessor()
video_pipeline = VideoPipeline()

@router.post("/detect/image")
async def detect_image(
    file: UploadFile = File(...),
    zone_rules: Optional[str] = Form(None),
    camera_id: Optional[str] = Form("CAM-01"),
    site_id: Optional[str] = Form("SITE-01")
):
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file format")

        parsed_rules = None
        if zone_rules:
            try:
                parsed_rules = json.loads(zone_rules)
            except Exception:
                parsed_rules = [r.strip() for r in zone_rules.split(",")]

        result = processor.process_frame(
            frame=frame,
            zone_rules=parsed_rules,
            camera_id=camera_id,
            site_id=site_id
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/detect/video")
async def detect_video(
    file: UploadFile = File(...),
    zone_rules: Optional[str] = Form(None),
    sample_rate: Optional[int] = Form(5),
    camera_id: Optional[str] = Form("CAM-01")
):
    try:
        suffix = os.path.splitext(file.filename)[1] or ".mp4"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            contents = await file.read()
            tmp.write(contents)
            tmp_path = tmp.name

        parsed_rules = None
        if zone_rules:
            try:
                parsed_rules = json.loads(zone_rules)
            except Exception:
                parsed_rules = [r.strip() for r in zone_rules.split(",")]

        result = video_pipeline.process_video_file(
            video_path=tmp_path,
            sample_rate=sample_rate,
            zone_rules=parsed_rules,
            camera_id=camera_id
        )

        try:
            os.remove(tmp_path)
        except Exception:
            pass

        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
