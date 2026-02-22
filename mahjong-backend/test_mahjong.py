from unittest import result
from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter
from mahjong.hand_calculating.hand_config import HandConfig
from mahjong.constants import EAST, SOUTH, WEST, NORTH
'''
Tiles:
1-9m = 1-9 manzu (characters)
1-9p = 1-9 pinzu (dots)
1-9s = 1-9 souzu (bamboo)
Honors: 1z=East, 2z=South, 3z=West, 4z=North, 5z=White, 6z=Green, 7z=Red
'''

honorMap = {
    'E': '1',
    'S': '2',
    'W': '3',
    'N': '4',
    'B': '5',
    'D': '6',
    'C': '7'
}

windMap = {
    'E': EAST,
    'S': SOUTH,
    'W': WEST,
    'N': NORTH
}

ERROR_MESSAGES = {
    "winning_tile_not_in_hand":         "The winning tile is not in the hand",
    "open_hand_riichi_not_allowed":     "Cannot declare riichi with an open hand",
    "open_hand_daburi_not_allowed":     "Cannot declare double riichi with an open hand",
    "ippatsu_without_riichi_not_allowed": "Cannot have ippatsu without riichi",
    "hand_not_winning":                 "The hand is not a winning hand",
    "hand_not_correct":                 "The hand is not valid (incorrect number of tiles)",
    "no_yaku":                          "The hand has no yaku",
    "chankan_with_tsumo_not_allowed":   "Chankan cannot be combined with tsumo",
    "rinshan_without_tsumo_not_allowed": "Rinshan requires tsumo",
    "haitei_without_tsumo_not_allowed": "Haitei requires tsumo",
    "houtei_with_tsumo_not_allowed":    "Houtei cannot be combined with tsumo",
    "haitei_with_rinshan_not_allowed":  "Haitei cannot be combined with rinshan",
    "houtei_with_chankan_not_allowed":  "Houtei cannot be combined with chankan",
    "tenhou_not_as_dealer":             "Tenhou can only be declared as dealer",
    "chiihou_as_dealer":                "Chiihou cannot be declared as dealer",
    "renhou_not_allowed":               "Renhou is not enabled in the current ruleset",
}

class BasicCalculator:

    def calculate_hand(self, tiles, win_tile_string=None, config_data={}):
        print("********************************")
        print("Calculating hand value...")
        # Initialize hand calculator and tile converter objects
        hand_calculator = HandCalculator()
        tiles_converter = TilesConverter()
        hand_config = HandConfig()
        #Set hand config values based on config_data
        hand_config = HandConfig(
            is_tsumo=config_data.get('is_tsumo', False),
            is_riichi=config_data.get('is_riichi', False),
            is_ippatsu=config_data.get('is_ippatsu', False),
            is_rinshan=config_data.get('is_rinshan', False),
            is_chankan=config_data.get('is_chankan', False),
            is_haitei=config_data.get('is_haitei', False),
            is_houtei=config_data.get('is_houtei', False),
            is_daburu_riichi=config_data.get('is_daburu_riichi', False),
            is_nagashi_mangan=config_data.get('is_nagashi_mangan', False),
            is_tenhou=config_data.get('is_tenhou', False),
            is_renhou=config_data.get('is_renhou', False),
            is_chiihou=config_data.get('is_chiihou', False),
            player_wind=windMap.get(config_data.get('player_wind', 'E')),
            round_wind=windMap.get(config_data.get('round_wind', 'E')),
        )
        
        #Convert input tiles into a string
        z, m, p, s = [], [], [], []

        for tile in tiles:
            if tile in honorMap:
                z.append(tile)
            elif tile[1] == 'm':
                if tile.endswith('r'):
                    m.append('0')  # red five becomes 0
                else:
                    m.append(tile[0])
            elif tile[1] == 'p':
                if tile.endswith('r'):
                    p.append('0')
                else:
                    p.append(tile[0])
            elif tile[1] == 's':
                if tile.endswith('r'):
                    s.append('0')
                else:
                    s.append(tile[0])
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
        tiles = tiles_converter.one_line_string_to_136_array(tiles_string)

        win_tile = None
        match win_tile_string[1] if len(win_tile_string) > 1 else win_tile_string:
            case 'm':
                win_tile_val = '0' if win_tile_string.endswith('r') else win_tile_string[0]
                win_tile = tiles_converter.string_to_136_array(man=win_tile_val)[0]
            case 'p':
                win_tile_val = '0' if win_tile_string.endswith('r') else win_tile_string[0]
                win_tile = tiles_converter.string_to_136_array(pin=win_tile_val)[0]
            case 's':
                win_tile_val = '0' if win_tile_string.endswith('r') else win_tile_string[0]
                win_tile = tiles_converter.string_to_136_array(sou=win_tile_val)[0]
            case _:
                win_tile = tiles_converter.string_to_136_array(honors=honorMap[win_tile_string])[0]
        print ("Inputted winning tile was " + win_tile_string)
        result = hand_calculator.estimate_hand_value(tiles, win_tile, config=hand_config)
        print(f"Calculated hand value: {result.han}")
        print("********************************")
        if result.error:
            print(f"Error calculating hand: {result.error}")
            friendly_message = ERROR_MESSAGES.get(result.error, f"Unknown error: {result.error}")
            return None, friendly_message
        return result, None

def main():
    calculator = BasicCalculator()
    tiles = ['1m', '1m', '1m', '2m', '2m', '2m', '3m', '3m', '3m', '4m', '4m', '4m', 'E', 'E']
    win_tile_string = 'E'
    result = calculator.calculate_hand(tiles, win_tile_string)
    print(f"Han: {result.han}, Fu: {result.fu}, Yaku: {result.yaku}")

if __name__ == "__main__":
    main()