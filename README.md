# Mahjong Vision

### Main Goal: Be able to join a session during an in person mahjong game and use this project as a real time score tracker at the end of each game.

## Components needed:
- Web Server
    - Server should be able to host rooms
    - Players should be able to use their web browser to join these rooms, up to 4 players each.
- Score Calculator
    - Most likely using the Mahjong python library, the backend should be able to calculate scores of inputted hands
        - Ideally, hands can be inputted via camera input
        - Primitively, users can input their hands
    - Based on the calculated score, the player who scored, and other game conditions, move around points amongst the players appropriately. (It should function similarly to the score calculations on Mahjong Soul)

## Challenges to Overcome:
- Web server infrastructure
    - Setting up lobby functionality
    - Enabling server to work from anyone's web browser.
- Hand input
    - Develop some sort of camera integration with the tool
    - **Have a classification model to identify tiles**
        - Likely will need some sort of manual input in cases where it doesn't work
- Score calculations