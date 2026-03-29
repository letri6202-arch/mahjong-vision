import numpy as np
import cv2

def detect_tiles(image):
	"""
	Detects Mahjong tiles in the input image.
	Args:
		image (np.ndarray): Input BGR image from OpenCV.
	Returns:
		dict: Detection results (for now, just returns the image shape and a placeholder list).
	"""
	# TODO: Replace with actual detection logic
	# Example: Convert to grayscale and threshold (placeholder)
	gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
	_, thresh = cv2.threshold(gray, 128, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
	# Find contours (potential tiles)
	contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
	tile_bounding_boxes = [cv2.boundingRect(cnt) for cnt in contours if cv2.contourArea(cnt) > 1000]
	return {
		'num_tiles_detected': len(tile_bounding_boxes),
		'tile_bounding_boxes': tile_bounding_boxes,
		'image_shape': image.shape
	}