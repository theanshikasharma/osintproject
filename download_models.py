import os
import urllib.request

MODEL_DIR = "models"
os.makedirs(MODEL_DIR, exist_ok=True)

PROTOTXT_URL = "https://raw.githubusercontent.com/Tony607/object-detection-demo/master/models/deploy.prototxt"
CAFFEMODEL_URL = "https://github.com/Tony607/object-detection-demo/raw/master/models/MobileNetSSD_deploy.caffemodel"

print("Downloading MobileNet-SSD model files...")

try:
    urllib.request.urlretrieve(PROTOTXT_URL, f"{MODEL_DIR}/deploy.prototxt")
    print(f"✓ Downloaded {MODEL_DIR}/deploy.prototxt")
except Exception as e:
    print(f"Error downloading prototxt: {e}")

try:
    urllib.request.urlretrieve(CAFFEMODEL_URL, f"{MODEL_DIR}/MobileNetSSD_deploy.caffemodel")
    print(f"✓ Downloaded {MODEL_DIR}/MobileNetSSD_deploy.caffemodel")
except Exception as e:
    print(f"Error downloading caffemodel: {e}")

print("\nDone! Run: python backend/main.py")

