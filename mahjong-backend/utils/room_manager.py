from models import Room, Player, Round
from test_mahjong import BasicCalculator # Importing to ensure hand calculation logic is available

import json
from flask import jsonify

class RoomManager:
    def __init__(self):
        self.rooms = {}
    
    def create_room(self, created_by):
        """Create a new room and add creator as first player"""
        room = Room(created_by=created_by)
        creator_player = Player(name=created_by)
        room.players.append(creator_player)
        self.rooms[room.id] = room
        return room
    
    def get_room(self, room_id):
        """Get room by ID and clean up stale players"""
        room = self.rooms.get(room_id)
        if room:
            room.cleanup_stale_players()
            room.update_status()
        return room
    
    def add_player_to_room(self, room_id, player_name):
        """Add a player to a room"""
        room = self.get_room(room_id)
        if not room:
            return None, 'Room not found'
        if room.status == 'in-game':
            return None, 'Game is in progress - cannot join'
        if len(room.players) >= room.max_players:
            return None, 'Room is full'
        
        player = Player(name=player_name)
        room.players.append(player)
        return player, None
    
    def remove_player_from_room(self, room_id, player_id):
        """Remove a player from a room"""
        room = self.get_room(room_id)
        if not room:
            return False
        room.players = [p for p in room.players if p.id != player_id]
        return True
    
    def toggle_player_ready(self, room_id, player_id):
        """Toggle a player's ready status"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        for player in room.players:
            if player.id == player_id:
                player.toggle_ready()
                room.update_status()
                return True
        return False
    
    def submit_hand(self, room_id, winner_id, hand_data):
        """
        Submit a winning hand and distribute points
        hand_data: {
            'tiles': [],
            'win_type': 'self-draw' or 'discard',
            'points': int,
            'payments': {player_id: points_paid, ...}
        }
        """
        point_calculator = BasicCalculator()
        room = self.get_room(room_id)
        if not room:
            return None, 'Room not found'
        
        # Find winner
        winner = None
        for player in room.players:
            if player.id == winner_id:
                winner = player
                break
        
        if not winner:
            return None, 'Player not found'
        
        # Create round record
        round_obj = Round(room.current_round, winner_id, winner.name)
        round_obj.tiles = hand_data.get('tiles', [])
        round_obj.win_type = hand_data.get('win_type', '')
        winning_tile = hand_data.get('winningTile', None)
        config_data = hand_data.get('config', {})
        result, error = point_calculator.calculate_hand(round_obj.tiles, winning_tile, config_data)  # Calculate points based on hand
        if error:
            return None, error
        points = result.cost["main"]
        print(f"Calculated points for hand: {points}")
        print(f"Yaku: {result.yaku}")
        # Update scores
        winner.score += points  

        # Record round
        round_obj.points = points
        room.rounds.append(round_obj)
        
        # Move to next round
        room.current_round += 1
        
        # Reset ready statuses for next round
        for player in room.players:
            player.ready = False
        
        return room, None
    
    def heartbeat(self, room_id, player_id):
        """Update player's last_seen timestamp"""
        room = self.get_room(room_id)
        if not room:
            return False
        
        for player in room.players:
            if player.id == player_id:
                player.ping()
                return True
        return False

room_manager = RoomManager()