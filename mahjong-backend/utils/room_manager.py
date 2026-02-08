from models import Room, Player

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
        return room
    
    def add_player_to_room(self, room_id, player_name):
        """Add a player to a room"""
        room = self.get_room(room_id)
        if not room:
            return None, 'Room not found'
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