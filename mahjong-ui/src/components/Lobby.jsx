import { useState, useEffect } from 'react'
import client from '../api/client'
import '../styles/Lobby.css'

function Lobby({ room, playerName, onLeave }) {
  const [updatedRoom, setUpdatedRoom] = useState(room)
  const [loading, setLoading] = useState(false)
  const [playerId, setPlayerId] = useState(null)

  // Find player ID from initial room data
  useEffect(() => {
    const player = room.players.find(p => p.name === playerName)
    if (player) {
      setPlayerId(player.id)
    }
  }, [room, playerName])

  // Refresh room state and send heartbeat
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await client.get(`/rooms/${room.id}`)
        setUpdatedRoom(response.data)

        // Send heartbeat if player ID is known
        if (playerId) {
          await client.post(`/rooms/${room.id}/players/${playerId}/heartbeat`)
        }
      } catch (err) {
        console.error('Failed to refresh room or heartbeat')
      }
    }, 5000) // Heartbeat every 5 seconds

    return () => clearInterval(interval)
  }, [room.id, playerId])

  const handleLeaveRoom = async () => {
    setLoading(true)
    try {
      if (playerId) {
        await client.delete(`/rooms/${room.id}/players/${playerId}`)
      }
      onLeave()
    } catch (err) {
      console.error('Failed to leave room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="lobby">
      <div className="room-info">
        <h2>Room: {updatedRoom.id}</h2>
        <p>Status: {updatedRoom.status}</p>
        <p>Players: {updatedRoom.player_count}/{updatedRoom.max_players}</p>
      </div>

      <div className="players-list">
        <h3>Players</h3>
        <ul>
          {updatedRoom.players.map((player) => (
            <li key={player.id}>{player.name} - Score: {player.score}</li>
          ))}
        </ul>
      </div>

      <button onClick={handleLeaveRoom} disabled={loading}>
        {loading ? 'Leaving...' : 'Leave Room'}
      </button>
    </div>
  )
}

export default Lobby