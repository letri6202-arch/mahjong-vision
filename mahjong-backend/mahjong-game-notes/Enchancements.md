# Back Log
## Large Enchancements
- Full Hand Integration
- Camera Integration
- Object Detection/Classification Model

## Small Enchancements
- Polish CSS
    - Gameboard
    - HandSubmissionForm
    - Lobby
- HandSubmissionForm:
    - Tile selection should be sequential
        - i.e. when you add a tile, the selected screen shows what you added in order.
        - Currently groups by the tile type, can be confusing
    - Add a CLEAR option for selecting tiles

### Known bugs:
- Not sure if this is intended, and if it should be kept: it will always choose the hand that gives you the most points.
    -i.e. 123123123 

### Weird Edge Cases:
- Selecting a win tile that is also a part of an open hand cannot happen. The winning tile must complete something that is part of your *closed* hand, so it logically cannot be part of any open meld.