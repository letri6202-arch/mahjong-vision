import { useState, useEffect } from 'react'
import client from './api/client'
import JoinRoom from './components/JoinRoom'
import Lobby from './components/Lobby'
import GameBoard from './components/GameBoard'
import './styles/App.css'

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [playerName, setPlayerName] = useState('')

  const handleRoomCreated = (room) => {
    setCurrentRoom(room)
    if (room.players.length > 0) {
      setPlayerName(room.players[0].name)
    }
  }

  const handleRoomJoined = (room) => {
    setCurrentRoom(room)
    if (room.players.length > 0) {
      setPlayerName(room.players[room.players.length - 1].name)
    }
  }

  // Periodically refresh room state to catch status changes
  useEffect(() => {
    if (!currentRoom) return

    const interval = setInterval(async () => {
      try {
        const response = await client.get(`/rooms/${currentRoom.id}`)
        setCurrentRoom(response.data)
      } catch (err) {
        console.error('Failed to refresh room')
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [currentRoom?.id])

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
      ) : currentRoom.status === 'in-game' ? (
        <GameBoard 
          room={currentRoom}
          playerName={playerName}
          onLeave={handleLeaveRoom}
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