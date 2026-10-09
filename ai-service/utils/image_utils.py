import base64
import cv2
import numpy as np

def base64_to_frame(b64_str: str) -> np.ndarray:
    if "," in b64_str:
        b64_str = b64_str.split(",")[1]
    img_data = base64.b64decode(b64_str)
    nparr = np.frombuffer(img_data, np.uint8)
    return cv2.imdecode(nparr, cv2.IMREAD_COLOR)

def frame_to_base64(frame: np.ndarray, quality: int = 85) -> str:
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality]
    _, buffer = cv2.imencode('.jpg', frame, encode_param)
    return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
