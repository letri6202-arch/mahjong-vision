from flask import Blueprint, request, jsonify
from utils.room_manager import room_manager
from utils.score_calculator import score_calculator

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

@rooms_bp.route('/submit_draw', methods=['POST'])
def submit_draw():
    """Submit a draw and distribute points for tenpai players"""
    data = request.get_json()
    players = data.get('players', [])
    room_result, error = score_calculator.submit_draw(players)
    if error:
        return jsonify({'error': error}), 400
    return jsonify(room_result), 200