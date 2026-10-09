import cv2
import os
import tempfile
from typing import Dict, Any, List
from pipelines.frame_processor import FrameProcessor
from engine.dedup_engine import DedupEngine
from app.config import settings

class VideoPipeline:
    def __init__(self):
        self.processor = FrameProcessor()
        self.dedup_engine = DedupEngine()

    def process_video_file(
        self,
        video_path: str,
        sample_rate: int = 5,
        zone_rules: List[str] = None,
        camera_id: str = "CAM-01"
    ) -> Dict[str, Any]:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            raise ValueError("Could not open video file")

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30

        aggregated_events = []
        key_evidence_frames = []
        frame_idx = 0
        violations_count = 0
        hazards_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            if frame_idx % sample_rate == 0:
                result = self.processor.process_frame(
                    frame=frame,
                    zone_rules=zone_rules,
                    camera_id=camera_id
                )

                for ev in result["events"]:
                    # Deduplication check
                    if self.dedup_engine.should_record_event(ev):
                        aggregated_events.append(ev)
                        if len(key_evidence_frames) < 5:
                            key_evidence_frames.append({
                                "frame_index": frame_idx,
                                "timestamp_sec": round(frame_idx / fps, 2),
                                "evidence_image": result["evidence_image"],
                                "event": ev
                            })

                violations_count += result["frame_summary"]["violations"]
                hazards_count += result["frame_summary"]["hazards"]

            frame_idx += 1

        cap.release()

        return {
            "total_frames": total_frames,
            "sampled_frames": frame_idx // sample_rate,
            "fps": fps,
            "unique_events_detected": len(aggregated_events),
            "events": aggregated_events,
            "evidence_frames": key_evidence_frames,
            "summary": {
                "total_violations": violations_count,
                "total_hazards": hazards_count
            }
        }
