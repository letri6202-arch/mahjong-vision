# HandConfig Parameters

## Boolean Flags

| Parameter | Default | Description |
|---|---|---|
| `is_tsumo` | `False` | Player won by self-draw rather than off another player's discard |
| `is_riichi` | `False` | Player declared riichi (closed hand tenpai declaration) |
| `is_ippatsu` | `False` | Player won within one go-around of declaring riichi, before any calls |
| `is_rinshan` | `False` | Player won off the supplemental draw after declaring a kan |
| `is_chankan` | `False` | Player won by stealing a tile added to an opponent's existing pon (robbing the kan) |
| `is_haitei` | `False` | Player won off the very last drawable tile in the wall (tsumo only) |
| `is_houtei` | `False` | Player won off the very last discard of the game (ron only) |
| `is_daburu_riichi` | `False` | Player declared riichi on their very first draw before any calls were made |
| `is_nagashi_mangan` | `False` | Player discarded only terminals and honors the entire round and had no calls made on their discards |
| `is_tenhou` | `False` | Dealer won on their initial dealt hand before any other draws (heavenly hand) |
| `is_renhou` | `False` | Non-dealer won by ron before their first draw (human hand, optional rule) |
| `is_chiihou` | `False` | Non-dealer won on their very first draw before any calls were made (earthly hand) |

## Wind Parameters

| Parameter | Default | Description |
|---|---|---|
| `player_wind` | `None` | The seat wind of the winning player. Affects yaku (seat wind triplets) and determines dealer status for scoring |
| `round_wind` | `None` | The current round wind. Affects yaku (round wind triplets) and determines dealer status for scoring |

Wind values should be passed as constants from the mahjong library:
```python
from mahjong.constants import EAST, SOUTH, WEST, NORTH
```

## Constraints & Interactions

- `is_ippatsu` requires `is_riichi` or `is_daburu_riichi` to be `True`
- `is_daburu_riichi` requires the hand to be closed
- `is_rinshan` requires `is_tsumo` to be `True`
- `is_haitei` requires `is_tsumo` to be `True`
- `is_houtei` requires `is_tsumo` to be `False`
- `is_chankan` and `is_tsumo` cannot both be `True`
- `is_haitei` and `is_rinshan` cannot both be `True`
- `is_houtei` and `is_chankan` cannot both be `True`
- `is_tenhou` can only be declared as dealer (`player_wind == round_wind`)
- `is_chiihou` cannot be declared as dealer

## Effect on Scoring

`player_wind` and `round_wind` together determine whether the winner is the dealer:
- **Dealer**: `player_wind == round_wind`
- **Non-dealer tsumo**: `is_tsumo == True` and `player_wind != round_wind`

This affects `result.cost`:
| Situation | `main` | `additional` |
|---|---|---|
| Ron | Full payment from discarder | `0` |
| Dealer tsumo | Each other player pays this | `0` |
| Non-dealer tsumo | Each non-dealer pays this | Dealer pays this |
