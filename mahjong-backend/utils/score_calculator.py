from test_mahjong import BasicCalculator
from mahjong.tile import TilesConverter
from mahjong.meld import Meld

import json
from flask import jsonify

from models import Player, Round, Room
from database import SessionLocal
from datetime import datetime
import uuid


honorMap = {
    'E': '1',
    'S': '2',
    'W': '3',
    'N': '4',
    'B': '5',
    'D': '6',
    'C': '7'
}

class ScoreCalculator:
    def __init__(self):
        pass

    def create_meld_tiles(self, tiles):
        tiles_converter = TilesConverter()
        if len(tiles[0]) < 2:
            meld_tiles_str = ''.join(honorMap[tile[0]] for tile in tiles)
            meld_tiles = tiles_converter.string_to_136_array(honors=meld_tiles_str)
            return meld_tiles
        
        suit = tiles[0][1] if tiles else None
        meld_tiles_str = ''.join(tile[0] for tile in tiles) 

        if suit == 'm':
            meld_tiles = tiles_converter.string_to_136_array(man=meld_tiles_str)
        elif suit == 'p':
            meld_tiles = tiles_converter.string_to_136_array(pin=meld_tiles_str)
        elif suit == 's':
            meld_tiles = tiles_converter.string_to_136_array(sou=meld_tiles_str)
        else:
            meld_tiles = []
        return meld_tiles
    
    def submit_hand(self, players, winner_id, hand_data):
        """
        Submit a winning hand and calculate points (in-memory, no DB)
        players: list of dicts [{id, name, score, is_dealer, ...}]
        winner_id: id of winning player
        hand_data: dict with hand info
        """
        point_calculator = BasicCalculator()
        tiles_converter = TilesConverter()
        tiles = hand_data.get('tiles', [])
        winning_tile = hand_data.get('winningTile', None)
        config_data = hand_data.get('config', {})


        # Build melds_data from hand_data
        melds_as_dicts = hand_data.get('melds_data', [])
        print("melds_as_dicts:", melds_as_dicts)
        melds_data = []
        for meld in melds_as_dicts:
            if meld['type'] == 'chi':
                meld_type = Meld.CHI
            elif meld['type'] == 'pon':
                meld_type = Meld.PON
            elif meld['type'] == 'kan':
                meld_type = Meld.KAN

            meld_tiles = self.create_meld_tiles(meld['tiles'])
            if meld_tiles is None:
                return None, 'Invalid meld tiles'
            temp_meld = Meld(meld_type=meld_type, tiles=meld_tiles, opened=meld.get('opened', True))

            melds_data.append(temp_meld)
        print("Meld Data:", melds_data)

        # Convert tiles to 136 array 
        has_aka_dora = False
        z, m, p, s = [], [], [], []
        for tile in tiles:
            if tile in honorMap:
                z.append(tile)
            elif tile[1] == 'm':
                if tile.endswith('r'):
                    m.append('0')
                    has_aka_dora = True
                else:
                    m.append(tile[0])
            elif tile[1] == 'p':
                if tile.endswith('r'):
                    p.append('0')
                    has_aka_dora = True
                else:
                    p.append(tile[0])
            elif tile[1] == 's':
                if tile.endswith('r'):
                    s.append('0')
                    has_aka_dora = True
                else:
                    s.append(tile[0])

        tiles_string = ''

        z_tiles_string = ''
        m_tiles_string = ''
        p_tiles_string = ''
        s_tiles_string = ''

        if z:
            z_tiles_string += ''.join([honorMap[t] for t in z])
        if m:
            m_tiles_string += ''.join(m)
        if p:
            p_tiles_string += ''.join(p)
        if s:
            s_tiles_string += ''.join(s)

        print('Tiles inputted (as string): ' + tiles_string)
        print('Has aka dora:', has_aka_dora)
        # tiles_136 = tiles_converter.one_line_string_to_136_array(tiles_string, has_aka_dora=has_aka_dora)
        tiles_136 = tiles_converter.string_to_136_array(man=m_tiles_string, sou=s_tiles_string, pin=p_tiles_string, honors = z_tiles_string, has_aka_dora = has_aka_dora)
        print("Tiles 136:", tiles_136)

        if has_aka_dora == False:
            # If the entry is 16, 52, or 88, then add 1 so that it is not counted as a red 5
            # 16 = 5m aka, 52 = 5p aka, 88 = 5s aka in 136 array
            for i in range(len(tiles_136)):
                if tiles_136[i] in [16, 52, 88]:
                    tiles_136[i] += 1
        print("Tiles 136 corrected:", tiles_136)
        doraIndicators = hand_data.get('dora_indicators', [])
        #Convert dora indicators to 136 array
        z, m, p, s = [], [], [], []
        for tile in doraIndicators:
            if tile in honorMap:
                z.append(tile)
            elif tile[1] == 'm':
                m.append('0' if tile.endswith('r') else tile[0])
            elif tile[1] == 'p':
                p.append('0' if tile.endswith('r') else tile[0])
            elif tile[1] == 's':
                s.append('0' if tile.endswith('r') else tile[0])

        tiles_string = ''
        if z:
            tiles_string += ''.join([honorMap[t] for t in z]) + 'z'
        if m:
            tiles_string += ''.join(m) + 'm'
        if p:
            tiles_string += ''.join(p) + 'p'
        if s:
            tiles_string += ''.join(s) + 's'

        print('Tiles inputted (as string): ' + tiles_string)
        dora_indicators_136 = tiles_converter.one_line_string_to_136_array(tiles_string)

        # Parse win tile
        win_tile = None
        match winning_tile[1] if len(winning_tile) > 1 else winning_tile:
            case 'm':
                win_tile_val = '0' if winning_tile.endswith('r') else winning_tile[0]
                win_tile = tiles_converter.string_to_136_array(man=win_tile_val)[0]
            case 'p':
                win_tile_val = '0' if winning_tile.endswith('r') else winning_tile[0]
                win_tile = tiles_converter.string_to_136_array(pin=win_tile_val)[0]
            case 's':
                win_tile_val = '0' if winning_tile.endswith('r') else winning_tile[0]
                win_tile = tiles_converter.string_to_136_array(sou=win_tile_val)[0]
            case _:
                win_tile = tiles_converter.string_to_136_array(honors=honorMap[winning_tile])[0]
        if has_aka_dora == False:
            if win_tile in [16, 52, 88]:
                win_tile += 1
        print("Inputted winning tile was " + winning_tile)
        
        result, error = point_calculator.calculate_hand(tiles_136, win_tile, config_data, melds_data=melds_data, dora_indicators=dora_indicators_136)
        
        if error:
            return None, error

        winning_hand_info = {
            "han": result.han,
            "fu": getattr(result, "fu", None),
            "yaku": [y.name for y in getattr(result, "yaku", [])],
            "points": result.cost["total"],
            "main": result.cost["main"],
            "additional": result.cost.get("additional", 0),
            "error": getattr(result, "error", None)
        }

        is_tsumo = config_data.get('is_tsumo', False)
        is_dealer = hand_data.get('is_dealer', False)
        points_gained = result.cost["total"]

        updated_players = [p.copy() for p in players]
        winner = next((p for p in updated_players if p['id'] == winner_id), None)
        if not winner:
            return None, 'Winner not found'
        if is_tsumo:
            if is_dealer:
                for player in updated_players:
                    if player['id'] != winner_id:
                        player['score'] -= result.cost["main"]
            else:
                for player in updated_players:
                    if player['id'] != winner_id:
                        if player.get('is_dealer'):
                            player['score'] -= result.cost["main"]
                        else:
                            player['score'] -= result.cost["additional"]
        else:
            discarderId = hand_data.get('discarderId')
            for player in updated_players:
                if player['id'] == discarderId:
                    player['score'] -= result.cost["main"]
        winner['score'] += points_gained
        # Return updated players and winning hand info

        return {"players": updated_players, "winning_hand_info": winning_hand_info}, None
    
    def submit_draw(self, players):
        updated_players = [p.copy() for p in players]   

        tenpai_list = []
        for player in updated_players:
            if player.get('tenpai', True):
                tenpai_list.append(player['id'])

        num_tenpai = len(tenpai_list)
        if num_tenpai == 1:
            for player in updated_players:
                if player['id'] == tenpai_list[0]:
                    player['score'] += 3000
                else:
                    player['score'] -= 1000
        elif num_tenpai == 2:
            for player in updated_players:
                if player['id'] in tenpai_list:
                    player['score'] += 1500
                else:
                    player['score'] -= 1500
        elif num_tenpai == 3:
            for player in updated_players:
                if player['id'] in tenpai_list:
                    player['score'] += 1000
                else:
                    player['score'] -= 3000
        draw_hand_info = {
            "tenpai": tenpai_list,
            "num_tenpai": num_tenpai,
            "tenpai_names": [p['name'] for p in updated_players if p['id'] in tenpai_list]
        }
        return {"players": updated_players, "draw_hand_info": draw_hand_info}, None



score_calculator = ScoreCalculator()