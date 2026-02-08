import { useState } from 'react'
import JoinRoom from './components/JoinRoom'
import Lobby from './components/Lobby'
import './styles/App.css'

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [playerName, setPlayerName] = useState('')

  const handleRoomCreated = (room) => {
    setCurrentRoom(room)
    // Get the creator's name from the first player in the room
    if (room.players.length > 0) {
      setPlayerName(room.players[0].name)
    }
  }

  const handleRoomJoined = (room) => {
    setCurrentRoom(room)
    // Get the current player's name from the most recent player added
    if (room.players.length > 0) {
      setPlayerName(room.players[room.players.length - 1].name)
    }
  }

  const handleLeaveRoom = () => {
    setCurrentRoom(null)
    setPlayerName('')
  }

  return (
    <div className="App">
      {!currentRoom ? (
        <JoinRoom 
          onRoomCreated={handleRoomCreated}
          onRoomJoined={handleRoomJoined}
        />
      ) : (
        <Lobby 
          room={currentRoom}
          playerName={playerName}
          onLeave={handleLeaveRoom}
        />
      )}
    </div>
  )
}

export default App