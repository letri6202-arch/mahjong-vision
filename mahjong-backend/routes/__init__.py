
from flask import Blueprint, request, jsonify
from utils.room_manager import room_manager

rooms_bp = Blueprint('rooms', __name__, url_prefix='/rooms')

@rooms_bp.route('', methods=['POST'])
def create_room():
    data = request.get_json()
    created_by = data.get('created_by', 'Anonymous')
    room = room_manager.create_room(created_by)
    return jsonify(room.to_dict()), 201

@rooms_bp.route('/<room_id>', methods=['GET'])
def get_room(room_id):
    room = room_manager.get_room(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    return jsonify(room.to_dict()), 200

@rooms_bp.route('/<room_id>/players', methods=['POST'])
def add_player(room_id):
    data = request.get_json()
    player_name = data.get('name', 'Player')
    player, error = room_manager.add_player_to_room(room_id, player_name)
    if error:
        return jsonify({'error': error}), 400
    room = room_manager.get_room(room_id)
    return jsonify(room.to_dict()), 200

@rooms_bp.route('/<room_id>/players', methods=['GET'])
def get_players(room_id):
    room = room_manager.get_room(room_id)
    if not room:
        return jsonify({'error': 'Room not found'}), 404
    return jsonify({
        'room_id': room_id,
        'players': [p.to_dict() for p in room.players],
        'count': len(room.players)
    }), 200

@rooms_bp.route('/<room_id>/players/<player_id>', methods=['DELETE'])
def remove_player(room_id, player_id):
    success = room_manager.remove_player_from_room(room_id, player_id)
    if not success:
        return jsonify({'error': 'Room not found'}), 404
    
    room = room_manager.get_room(room_id)
    return jsonify(room.to_dict()), 200

@rooms_bp.route('/<room_id>/players/<player_id>/ready', methods=['POST'])
def toggle_ready(room_id, player_id):
    """Toggle player's ready status"""
    success = room_manager.toggle_player_ready(room_id, player_id)
    if not success:
        return jsonify({'error': 'Player or room not found'}), 404
    
    room = room_manager.get_room(room_id)
    return jsonify(room.to_dict()), 200

@rooms_bp.route('/<room_id>/hands', methods=['POST'])
def submit_hand(room_id):
    """Submit a winning hand and distribute points"""
    data = request.get_json()
    winner_id = data.get('winner_id')
    hand_data = data.get('hand_data', {})
    
    room, error = room_manager.submit_hand(room_id, winner_id, hand_data)
    if error:
        return jsonify({'error': error}), 400
    
    return jsonify(room.to_dict()), 200

@rooms_bp.route('/<room_id>/players/<player_id>/heartbeat', methods=['POST'])
def player_heartbeat(room_id, player_id):
    """Keep-alive endpoint to track active players"""
    success = room_manager.heartbeat(room_id, player_id)
    if not success:
        return jsonify({'error': 'Player or room not found'}), 404
    
    room = room_manager.get_room(room_id)
    return jsonify(room.to_dict()), 200

@rooms_bp.route('/<room_id>/players/<player_id>/set_player_wind', methods=['POST'])
def set_player_wind(room_id, player_id):
    data = request.get_json()
    wind = data.get('wind')
    prevWind = data.get('prevWind')
    success = room_manager.set_player_wind(room_id, player_id, wind, prevWind)
    room = room_manager.get_room(room_id)
    
    if not success:
        return jsonify({'error': 'Player or room not found'}), 404
    
    room = room_manager.get_room(room_id)
    return jsonify(room.to_dict()), 200

@rooms_bp.route('/<room_id>/players/<player_id>/set_round_wind', methods=['POST'])
def set_round_wind(room_id, player_id):
    data = request.get_json()
    wind = data.get('wind')
    success = room_manager.set_round_wind(room_id, player_id, wind)
    room = room_manager.get_room(room_id)
    
    if not success:
        return jsonify({'error': 'Player or room not found'}), 404
    
    room = room_manager.get_room(room_id)
    return jsonify(room.to_dict()), 200