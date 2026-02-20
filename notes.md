Backend Directory Structure — Create backend with:

app.py — Flask app entry point
requirements.txt — Python dependencies (Flask, mahjong library later)
config.py — Config (port, debug mode, etc.)
routes/ — Folder for API endpoints (rooms.py, players.py, scores.py)
models/ — Data classes (Room, Player, Game)
utils/ — Helper functions
.env — Local environment variables
venv/ — Python virtual environment (generated)
Frontend Directory Structure — Create frontend with:

package.json — Node dependencies (React, Vite, Axios)
index.html — Entry point
src/ — React code:
main.jsx — App entry
App.jsx — Root component
components/ — UI components (JoinRoom, Lobby, GameBoard, etc.)
api/ — Axios client for backend calls
styles/ — CSS/styling
node_modules/ — Generated
dist/ — Build output (generated)
Initialize Backend

Create virtual environment: python -m venv backend/venv
Create backend/requirements.txt with: Flask, python-dotenv, cors (Flask-CORS for cross-origin requests)
Install dependencies: pip install -r requirements.txt
Create backend/app.py with Flask app boilerplate + CORS enabled
Create basic /health endpoint to test it works
Initialize Frontend

Create React app: npm create vite@latest frontend -- --template react
Install Axios: npm install axios
Create src/api/client.js for HTTP calls to backend
Create Core API Endpoints in backend/routes:

GET /health — Server status
POST /rooms — Create new room (returns room ID)
GET /rooms/<room_id> — Join room, get room state
POST /rooms/<room_id>/players — Add player to room
GET /rooms/<room_id>/players — List players in room
(Later: score endpoints)
Create Core Frontend Components:

JoinRoom.jsx — Input field for room ID + button to join
Lobby.jsx — Display room & connected players
GameBoard.jsx — (Placeholder for score input later)
Wire Up Initial Flow:

User lands on app → sees JoinRoom form
Clicks "Create Room" → POST /rooms → gets room ID
Displays room code → other users can paste it to join
Joined players shown in Lobby
Test Locally:

Terminal 1: cd backend && source venv/Scripts/activate && python app.py (backend on port 5000)
Terminal 2: cd frontend && npm run dev (frontend on port 5173)
Open http://localhost:5173 → test creating & joining rooms