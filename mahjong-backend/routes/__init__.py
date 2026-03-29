from flask import Blueprint, request, jsonify
import base64
import cv2
import numpy as np
from flask import Blueprint, request, jsonify
from utils.room_manager import room_manager
from utils.score_calculator import score_calculator
from utils.image_capture import capture_image
from utils.image_processing import detect_tiles

rooms_bp = Blueprint('rooms', __name__)

@rooms_bp.route('/submit_hand', methods=['POST'])
def submit_hand():
    """Submit a winning hand and distribute points"""
    data = request.get_json()
    players = data.get('players', [])
    winner_id = data.get('winner_id')
    hand_data = data.get('hand_data', {})
    room_result, error = score_calculator.submit_hand(players, winner_id, hand_data)
    if error:
        return jsonify({'error': error}), 400
    # room_result contains both room and winning_hand_info
    return jsonify(room_result), 200

@rooms_bp.route('/capture_image', methods=['POST'])
def capture_image_route():
    """Capture an image from the camera and return the file path."""
    try:
        image_path = capture_image()
        return jsonify({'image_path': image_path}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@rooms_bp.route('/process_image', methods=['POST'])
def process_image_route():
    """Accepts an uploaded image and processes it with OpenCV."""
    if 'image' not in request.files:
        return jsonify({'error': 'No image file provided'}), 400
    file = request.files['image']
    # Read image file as bytes
    file_bytes = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)
    if img is None:
        return jsonify({'error': 'Invalid image data'}), 400
    # Call tile detection
    detection_result = detect_tiles(img)
    return jsonify({'message': 'Image processed', 'detection': detection_result}), 200

@rooms_bp.route('/submit_draw', methods=['POST'])
def submit_draw():
    """Submit a draw and distribute points for tenpai players"""
    data = request.get_json()
    players = data.get('players', [])
    room_result, error = score_calculator.submit_draw(players)
    if error:
        return jsonify({'error': error}), 400
    return jsonify(room_result), 200