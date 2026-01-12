import cv2
import numpy as np
from typing import Tuple, Optional

CONFIDENCE_THRESHOLD = 0.5
MODEL_DIR = "models"
PROTOTXT = f"{MODEL_DIR}/deploy.prototxt"
CAFFEMODEL = f"{MODEL_DIR}/MobileNetSSD_deploy.caffemodel"

def load_model() -> cv2.dnn.Net:
    return cv2.dnn.readNetFromCaffe(PROTOTXT, CAFFEMODEL)

def detect_humans(image: np.ndarray, net: cv2.dnn.Net, confidence_threshold: float = CONFIDENCE_THRESHOLD) -> Tuple[bool, int, str, Optional[float]]:
    (h, w) = image.shape[:2]
    blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 0.007843, (300, 300), 127.5)
    net.setInput(blob)
    detections = net.forward()
    human_count = 0
    max_confidence = 0.0

    for i in range(detections.shape[2]):
        confidence = detections[0, 0, i, 2]
        if confidence > confidence_threshold:
            class_id = int(detections[0, 0, i, 1])
            if class_id == 15:
                human_count += 1
                if confidence > max_confidence:
                    max_confidence = confidence

    if human_count > 0:
        return True, human_count, "Human detected", max_confidence
    return False, 0, "No human detected", None

def analyze_human_detection(image: np.ndarray, net: cv2.dnn.Net, confidence_threshold: float = CONFIDENCE_THRESHOLD) -> dict:
    human_detected, human_count, status_message, max_confidence = detect_humans(image, net, confidence_threshold)
    return {
        "humanDetected": human_detected,
        "humanCount": human_count,
        "confidence": max_confidence if max_confidence else 0.0
    }

