import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from database import Base, SessionLocal

class Room(Base):
    def to_dict(self):
        return {
            'id': self.id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'created_by': self.created_by,
            'max_players': self.max_players,
            'status': self.status,
            'current_round': self.current_round,
            'round_wind': self.round_wind,
            'selected_winds': self.selected_winds if self.selected_winds else {w: None for w in ['E','S','W','N']},
            'players': [p.to_dict() for p in self.players] if hasattr(self, 'players') else [],
            'rounds': [r.to_dict() for r in self.rounds] if hasattr(self, 'rounds') else []
        }
    __tablename__ = 'rooms'
    id = Column(String(8), primary_key=True)
    created_at = Column(DateTime, nullable=False)
    created_by = Column(String(255))
    max_players = Column(Integer, default=4)
    status = Column(String(20), default='waiting')
    current_round = Column(Integer, default=0)
    round_wind = Column(String(2))
    selected_winds = Column(String, default='{"E": null, "S": null, "W": null, "N": null}')
    players = relationship('Player', backref='room', lazy=True)
    rounds = relationship('Round', backref='room', lazy=True)

class Player(Base):
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'score': self.score,
            'ready': self.ready,
            'last_seen': self.last_seen.isoformat() if self.last_seen else None,
            'wind': self.wind,
            'is_dealer': self.is_dealer,
            'room_id': self.room_id
        }
    __tablename__ = 'players'
    id = Column(String(8), primary_key=True)
    name = Column(String(255), nullable=False)
    score = Column(Integer, default=25000)
    ready = Column(Boolean, default=False)
    last_seen = Column(DateTime, nullable=False)
    wind = Column(String(2))
    is_dealer = Column(Boolean, default=False)
    room_id = Column(String(8), ForeignKey('rooms.id'))

class Round(Base):
    def to_dict(self):
        return {
            'id': self.id,
            'round_number': self.round_number,
            'winner_id': self.winner_id,
            'winner_name': self.winner_name,
            'win_type': self.win_type,
            'points': self.points,
            'timestamp': self.timestamp.isoformat() if self.timestamp else None,
            'room_id': self.room_id
        }
    __tablename__ = 'rounds'
    id = Column(String(8), primary_key=True)
    round_number = Column(Integer, nullable=False)
    winner_id = Column(String(8), ForeignKey('players.id'))
    winner_name = Column(String(255))
    win_type = Column(String(20))
    points = Column(Integer, default=0)
    timestamp = Column(DateTime, nullable=False)
    room_id = Column(String(8), ForeignKey('rooms.id'))