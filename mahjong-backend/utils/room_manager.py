from unittest import result

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
        
        # Calculate points and distribute
        is_tsumo = config_data.get('is_tsumo', False)
        is_dealer = hand_data.get('is_dealer', False)

        points_gained = result.cost["total"]

        if is_tsumo:
            if is_dealer:
                for player in room.players:
                    if player.id != winner_id:
                        player.score -= result.cost["main"]
            else:
                for player in room.players:
                    if player.id != winner_id:
                        if player.is_dealer:
                            player.score -= result.cost["main"]
                        else:
                            player.score -= result.cost["additional"]
        else:
            # Ron - only the discarder pays
            discarderId = hand_data.get('discarderId')
            for player in room.players:
                if player.id == discarderId:
                    player.score -= result.cost["main"]

        # Apply points to winner
        winner = next(p for p in room.players if p.id == winner_id)
        winner.score += points_gained

        print(f"Calculated points for hand: {points_gained}")
        print(f"Yaku: {result.yaku}")
        print("cost details:", result.cost.get("main",-1) + result.cost["additional"])
        # Update scores
        winner.score += points_gained  

        # Record round
        round_obj.points = points_gained
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
    
    def set_player_wind(self, room_id, player_id, wind, prevWind):
        """Set a player's wind"""
        room = self.get_room(room_id)
        if not room:
            return False
        player = None
        for p in room.players:
            if p.id == player_id:
                player = p
                break

        if not player:
            return False
        print("room round wind:", room.round_wind)
        #Determine if player is dealer as well
        if wind == room.round_wind:
            player.set_dealer_status(True)
        else:
            player.set_dealer_status(False)

        print(f"Setting wind {wind} for player {player_id} with previous wind {prevWind}")
        # Clear previous wind if different
        if prevWind and prevWind != wind:
            room.selected_winds[prevWind] = None

        # Clear wind if reselecting same wind
        if prevWind and prevWind == wind:
            room.selected_winds[prevWind] = None
            player.set_wind(None)
            return True
                
        # Assign new wind if not taken
        if room.selected_winds.get(wind) == None:
            room.selected_winds[wind] = player_id
        else:
            return False  # Wind already taken

        try:
            player.set_wind(wind)
        except Exception as e:
            print(f"Error setting wind: {e}")
            return False
        
        return True
    
    def set_round_wind(self, room_id, player_id, wind):
        """Set the round wind for the room"""
        room = self.get_room(room_id)
        if not room:
            return False
        room.set_round_wind(wind)
        return True
    
room_manager = RoomManager()