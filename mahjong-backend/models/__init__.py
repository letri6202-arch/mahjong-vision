import uuid
from datetime import datetime

class Room:
    def __init__(self, room_id=None, created_by=None):
        self.id = room_id or str(uuid.uuid4())[:8]
        self.created_at = datetime.now()
        self.created_by = created_by
        self.players = []
        self.max_players = 4
        self.status = 'waiting'  # waiting, ready, in-game, finished
        self.current_round = 0
        self.rounds = []  # Track hand history
        self.selected_winds = {'E': None, 'S': None, 'W': None, 'N': None}  # e.g., {'player_id': 'E', ...}
        self.round_wind = None  # Current round wind
    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'created_by': self.created_by,
            'players': [p.to_dict() for p in self.players],
            'player_count': len(self.players),
            'max_players': self.max_players,
            'status': self.status,
            'current_round': self.current_round,
            'rounds': [r.to_dict() for r in self.rounds],
            "selected_winds": self.selected_winds,
            "round_wind": self.round_wind
        }
    
    def cleanup_stale_players(self, timeout_seconds=30):
        """Remove players who haven't pinged in timeout_seconds"""
        now = datetime.now()
        self.players = [
            p for p in self.players 
            if (now - p.last_seen).total_seconds() < timeout_seconds
        ]
    
    def all_players_ready(self):
        """Check if all players are ready"""
        if len(self.players) == 0:
            return False
        return all(p.ready for p in self.players)
    
    def update_status(self):
        """Update room status based on player readiness"""
        if self.status == 'waiting' and self.all_players_ready():
            self.status = 'in-game'
            self.current_round = 1
        elif self.status == 'in-game' and not self.all_players_ready():
            self.status = 'waiting'

    def set_round_wind(self, wind):
        """Set the current round wind"""
        self.round_wind = wind

class Player:
    def __init__(self, name, player_id=None):
        self.id = player_id or str(uuid.uuid4())[:8]
        self.name = name
        self.score = 25000
        self.ready = False
        self.last_seen = datetime.now()
        self.wind = None
        self.is_dealer = False
    
    def ping(self):
        """Update last_seen timestamp"""
        self.last_seen = datetime.now()
    
    def toggle_ready(self):
        """Toggle ready status"""
        self.ready = not self.ready
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'score': self.score,
            'ready': self.ready,
            'wind': self.wind,
            'is_dealer': self.is_dealer
        }
    
    def set_wind(self, wind):
        """Set player's wind based on input"""
        self.wind = wind
    def set_dealer_status(self, is_dealer):
        """Set whether the player is dealer"""
        self.is_dealer = is_dealer
class Round:
    def __init__(self, round_number, winner_id, winner_name):
        self.id = str(uuid.uuid4())[:8]
        self.round_number = round_number
        self.winner_id = winner_id
        self.winner_name = winner_name
        self.tiles = []  # List of tile codes
        self.win_type = ''  # e.g., 'self-draw', 'discard'
        self.points = 0
        self.payments = {}  # {player_id: points_paid}
        self.timestamp = datetime.now()
    
    def to_dict(self):
        return {
            'id': self.id,
            'round_number': self.round_number,
            'winner_id': self.winner_id,
            'winner_name': self.winner_name,
            'tiles': self.tiles,
            'win_type': self.win_type,
            'points': self.points,
            'payments': self.payments,
            'timestamp': self.timestamp.isoformat()
        }