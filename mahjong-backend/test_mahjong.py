from unittest import result
from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter

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

class BasicCalculator:

    def calculate_hand(self, tiles, win_tile_string=None):
        print("Calculating hand value...")
        # Initialize hand calculator and tile converter objects
        hand_calculator = HandCalculator()
        tiles_converter = TilesConverter()

        #Convert input tiles into a string
        z, m, p, s = [], [], [], []

        for tile in tiles:
            if tile in honorMap:
                z.append(tile)
            elif tile[1] == 'm':
                if tile.endswith('r'):
                    m.append(tile[0] + 'r')
                else:
                    m.append(tile[0])
            elif tile[1] == 'p':
                if tile.endswith('r'):
                    p.append(tile[0] + 'r') 
                else:
                    p.append(tile[0])
            elif tile[1] == 's':
                if tile.endswith('r'):
                    s.append(tile[0] + 'r')
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
        print(tiles_string)
        tiles = tiles_converter.one_line_string_to_136_array(tiles_string)

        print(tiles)
        # # For testing, set win_tile to the last tile in the list
        # if tiles and not win_tile_string:
        #     if z:
        #         win_tile = tiles_converter.string_to_136_array(honors=honorMap[z[-1]])[0]
        #     elif m:
        #         win_tile = tiles_converter.string_to_136_array(man=''.join(m[-1]))[0]
        #     elif p:
        #         win_tile = tiles_converter.string_to_136_array(pin=''.join(p[-1]))[0]
        #     elif s:         
        #         win_tile = tiles_converter.string_to_136_array(sou=''.join(s[-1]))[0]
   
        win_tile = None
        match win_tile_string[1] if len(win_tile_string) > 1 else win_tile_string:
            case 'm':
                win_tile = tiles_converter.string_to_136_array(man=win_tile_string[0])[0]
            case 'p':
                win_tile = tiles_converter.string_to_136_array(pin=win_tile_string[0])[0]
            case 's':
                win_tile = tiles_converter.string_to_136_array(sou=win_tile_string[0])[0]
            case _:
                win_tile = tiles_converter.string_to_136_array(honors=honorMap[win_tile_string])[0]
        print ("Inputted winning tile was " + win_tile_string)
        result = hand_calculator.estimate_hand_value(tiles, win_tile)
        print(f"Calculated hand value: {result.han}")
        return result

def main():
    calculator = BasicCalculator()
    tiles = ['1m', '1m', '1m', '2m', '2m', '2m', '3m', '3m', '3m', '4m', '4m', '4m', 'E', 'E']
    win_tile_string = 'E'
    result = calculator.calculate_hand(tiles, win_tile_string)
    print(f"Han: {result.han}, Fu: {result.fu}, Yaku: {result.yaku}")

if __name__ == "__main__":
    main()