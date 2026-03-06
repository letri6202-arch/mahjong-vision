from unittest import result

from models import Room, Player, Round
from test_mahjong import BasicCalculator # Importing to ensure hand calculation logic is available

import json
from flask import jsonify

class RoomManager:
    def __init__(self):
        pass
    
    def create_room(self, created_by):
        """Create a new room and add creator as first player"""
        from models import Room, Player
        from database import SessionLocal
        import uuid
        from datetime import datetime
        session = SessionLocal()
        room_id = str(uuid.uuid4())[:8]
        room = Room(
            id=room_id,
            created_at=datetime.utcnow(),
            created_by=created_by,
            max_players=4,
            status='waiting',
            current_round=0
        )
        session.add(room)
        session.commit()
        creator_player = Player(
            id=str(uuid.uuid4())[:8],
            name=created_by,
            score=25000,
            ready=False,
            last_seen=datetime.utcnow(),
            wind=None,
            is_dealer=False,
            room_id=room.id
        )
        session.add(creator_player)
        session.commit()
        session.refresh(room)
        room_dict = room.to_dict()
        session.close()
        return room_dict
    
    def get_room(self, room_id):
        """Get room by ID from the database"""
        from models import Room
        from database import SessionLocal
        session = SessionLocal()
        room = session.query(Room).filter_by(id=room_id).first()
        if room:
            session.refresh(room)
            room_dict = room.to_dict()
        else:
            room_dict = None
        session.close()
        return room_dict
    
    def add_player_to_room(self, room_id, player_name):
        """Add a player to a room using the database"""
        from models import Player, Room
        from database import SessionLocal
        session = SessionLocal()
        room = session.query(Room).filter_by(id=room_id).first()
        if not room:
            session.close()
            return None, 'Room not found'
        if room.status == 'in-game':
            session.close()
            return None, 'Game is in progress - cannot join'
        if len(room.players) >= room.max_players:
            session.close()
            return None, 'Room is full'
        import uuid
        from datetime import datetime
        player = Player(
            id=str(uuid.uuid4())[:8],
            name=player_name,
            score=25000,
            ready=False,
            last_seen=datetime.utcnow(),
            wind=None,
            is_dealer=False,
            room_id=room.id
        )
        session.add(player)
        session.commit()
        session.refresh(player)
        player_dict = player.to_dict()
        session.close()
        return player_dict, None
    
    def remove_player_from_room(self, room_id, player_id):
        """Remove a player from a room using the database"""
        from models import Player
        from database import SessionLocal
        session = SessionLocal()
        player = session.query(Player).filter_by(id=player_id, room_id=room_id).first()
        if not player:
            session.close()
            return False
        session.delete(player)
        session.commit()
        session.close()
        return True
    
    def toggle_player_ready(self, room_id, player_id):
        """Toggle a player's ready status using the database and start game if all ready"""
        from models import Player, Room
        from database import SessionLocal
        session = SessionLocal()
        player = session.query(Player).filter_by(id=player_id, room_id=room_id).first()
        if not player:
            session.close()
            return False
        player.ready = not player.ready
        session.commit()
        # Check if all players are ready
        room = session.query(Room).filter_by(id=room_id).first()
        players = session.query(Player).filter_by(room_id=room_id).all()
        if all(p.ready for p in players) and len(players) > 0:
            room.status = 'in-game'
            session.commit()
        session.close()
        return True
    
    def submit_hand(self, room_id, winner_id, hand_data):
        """
        Submit a winning hand and distribute points using the database
        """
        from models import Player, Round, Room
        from database import SessionLocal
        from datetime import datetime
        import uuid
        point_calculator = BasicCalculator()
        session = SessionLocal()
        room = session.query(Room).filter_by(id=room_id).first()
        if not room:
            session.close()
            return None, 'Room not found'
        winner = session.query(Player).filter_by(id=winner_id, room_id=room_id).first()
        if not winner:
            session.close()
            return None, 'Player not found'
        tiles = hand_data.get('tiles', [])
        win_type = hand_data.get('win_type', '')
        winning_tile = hand_data.get('winningTile', None)
        config_data = hand_data.get('config', {})
        result, error = point_calculator.calculate_hand(tiles, winning_tile, config_data)
        if error:
            session.close()
            return None, error
        is_tsumo = config_data.get('is_tsumo', False)
        is_dealer = hand_data.get('is_dealer', False)
        points_gained = result.cost["total"]
        players = session.query(Player).filter_by(room_id=room_id).all()
        if is_tsumo:
            if is_dealer:
                for player in players:
                    if player.id != winner_id:
                        player.score -= result.cost["main"]
            else:
                for player in players:
                    if player.id != winner_id:
                        if player.is_dealer:
                            player.score -= result.cost["main"]
                        else:
                            player.score -= result.cost["additional"]
        else:
            discarderId = hand_data.get('discarderId')
            for player in players:
                if player.id == discarderId:
                    player.score -= result.cost["main"]
        winner.score += points_gained
        session.commit()
        round_obj = Round(
            id=str(uuid.uuid4())[:8],
            round_number=room.current_round,
            winner_id=winner_id,
            winner_name=winner.name,
            win_type=win_type,
            points=points_gained,
            timestamp=datetime.utcnow(),
            room_id=room_id
        )
        session.add(round_obj)
        room.current_round += 1
        for player in players:
            player.ready = False
        session.commit()
        session.refresh(room)
        room_dict = room.to_dict()
        session.close()
        return room_dict, None
    
    def heartbeat(self, room_id, player_id):
        """Update player's last_seen timestamp using the database"""
        from models import Player
        from database import SessionLocal
        from datetime import datetime
        session = SessionLocal()
        player = session.query(Player).filter_by(id=player_id, room_id=room_id).first()
        if not player:
            session.close()
            return False
        player.last_seen = datetime.utcnow()
        session.commit()
        session.close()
        return True
    
    def set_player_wind(self, room_id, player_id, wind, prevWind):
        """Set a player's wind using the database and update selected_winds"""
        from models import Player, Room
        from database import SessionLocal
        import json
        session = SessionLocal()
        room = session.query(Room).filter_by(id=room_id).first()
        player = session.query(Player).filter_by(id=player_id, room_id=room_id).first()
        if not room or not player:
            session.close()
            return False
        # Load selected_winds from JSON
        winds = json.loads(room.selected_winds) if room.selected_winds else {w: None for w in ['E','S','W','N']}
        # Clear previous wind if different
        if prevWind and prevWind != wind:
            winds[prevWind] = None
        # Clear wind if reselecting same wind
        if prevWind and prevWind == wind:
            winds[prevWind] = None
            player.wind = None
            room.selected_winds = json.dumps(winds)
            session.commit()
            session.close()
            return True
        # Assign new wind if not taken
        if winds.get(wind) is None:
            winds[wind] = player_id
        else:
            session.close()
            return False  # Wind already taken
        player.is_dealer = (wind == room.round_wind)
        player.wind = wind
        room.selected_winds = json.dumps(winds)
        session.commit()
        session.close()
        return True
    
    def set_round_wind(self, room_id, player_id, wind):
        """Set the round wind for the room using the database"""
        from models import Room
        from database import SessionLocal
        session = SessionLocal()
        room = session.query(Room).filter_by(id=room_id).first()
        if not room:
            session.close()
            return False
        room.round_wind = wind
        session.commit()
        session.close()
        return True
    
room_manager = RoomManager()