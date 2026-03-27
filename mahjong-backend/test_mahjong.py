from collections.abc import Collection
from unittest import result
from mahjong.hand_calculating.hand import HandCalculator
from mahjong.tile import TilesConverter
from mahjong.hand_calculating.hand_config import HandConfig, OptionalRules
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

    def calculate_hand(self, tiles_136, win_tile=None, config_data={}, melds_data=[], dora_indicators: Collection[int] | None = None, ura_dora_indicators: Collection[int] | None = None):
        print("********************************")
        print("Calculating hand value...")
        hand_calculator = HandCalculator()
        tiles_converter = TilesConverter()

        optional_rules=OptionalRules(
            # --- Open tanyao ---
            # Most modern rulesets (tenhou, majsoul, most club play) allow this
            has_open_tanyao=True,           # default: False
             # --- Aka dora (red fives) ---
            # Standard in modern play: one red five per suit (3 total)
            has_aka_dora=True,              # default: False

            # --- Renhou ---
            # Winning by ron on the first go-around as a non-dealer
            # Value varies by ruleset — mangan or yakuman
            renhou_as_yakuman=False,        # default: False (treated as mangan)

            # --- Kazoe yakuman ---
            # What happens when han count reaches 13+
            # KAZOE_LIMITED = capped at yakuman, KAZOE_NO_LIMIT = count every han
            kazoe_limit=HandConfig.KAZOE_LIMITED,   # default: KAZOE_LIMITED

            # --- Kiriage mangan ---
            # Round up 4 han 30 fu / 3 han 60 fu to mangan
            # Used in some rulesets, not standard on tenhou
            kiriage=False,                  # default: False

            # --- Double yakuman ---
            # Some yakuman hands count as double (e.g. pure nine gates, four concealed quads)
            has_double_yakuman=True,        # default: True

            # --- Sashikomi ---
            # When a player deals into a hand that only wins due to yakitori/special conditions
            # Rarely toggled directly
        )

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
            options=optional_rules
        )

        result = hand_calculator.estimate_hand_value(tiles_136, win_tile, melds=melds_data, config=hand_config, dora_indicators=dora_indicators)
        print(f"Win tile 136: {win_tile}")
        print(f"Is riichi: {hand_config.is_riichi}")
        print(f"Result error: {result.error}")
        print(f"Calculated hand value: {result.han}")
        print(f"Calculated yaku: {result.yaku}")
        if not result.error:
            print(f"Main = {result.cost['main']}")
            print(f"Additional = {result.cost['additional']}")
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
    result, error = calculator.calculate_hand(tiles, win_tile_string)
    if error:
        print(f"Error calculating hand: {error}")
    else:
        print(f"Han: {result.han}, Fu: {result.fu}, Yaku: {result.yaku}")

if __name__ == "__main__":
    main()