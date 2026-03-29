import cv2
import os
from datetime import datetime

def capture_image(save_dir='captured_images'):
    """Capture an image from the default camera and save it."""
    if not os.path.exists(save_dir):
        os.makedirs(save_dir)
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        raise RuntimeError('Could not open camera.')
    ret, frame = cap.read()
    cap.release()
    if not ret:
        raise RuntimeError('Failed to capture image.')
    filename = datetime.now().strftime('%Y%m%d_%H%M%S') + '.jpg'
    filepath = os.path.join(save_dir, filename)
    cv2.imwrite(filepath, frame)
    return filepath
