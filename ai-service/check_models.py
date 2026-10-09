from huggingface_hub import hf_hub_download
from ultralytics import YOLO

try:
    print("Downloading keremberke model...")
    weights_path = hf_hub_download(repo_id="keremberke/yolov8m-protective-equipment-detection", filename="best.pt")
    model = YOLO(weights_path)
    print("Classes keremberke:", model.names)
except Exception as e:
    print(e)
