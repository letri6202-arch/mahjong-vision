import uuid
from datetime import datetime

class Room:
    def __init__(self, room_id=None, created_by=None):
        self.id = room_id or str(uuid.uuid4())[:8]
        self.created_at = datetime.now()
        self.created_by = created_by
        self.players = []
        self.max_players = 4
        self.status = 'waiting'
    
    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat(),
            'created_by': self.created_by,
            'players': [p.to_dict() for p in self.players],
            'player_count': len(self.players),
            'max_players': self.max_players,
            'status': self.status
        }
    
    def cleanup_stale_players(self, timeout_seconds=10):
        """Remove players who haven't pinged in timeout_seconds"""
        now = datetime.now()
        self.players = [
            p for p in self.players 
            if (now - p.last_seen).total_seconds() < timeout_seconds
        ]

class Player:
    def __init__(self, name, player_id=None):
        self.id = player_id or str(uuid.uuid4())[:8]
        self.name = name
        self.score = 0
        self.last_seen = datetime.now()
    
    def ping(self):
        """Update last_seen timestamp"""
        self.last_seen = datetime.now()
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'score': self.score
        }