import { useState, useEffect } from 'react'
import client from '../api/client'
import HandSubmissionForm from './HandSubmissionForm'
import '../styles/GameBoard.css'

function GameBoard({ room, playerName, onLeave }) {
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
    }, 5000)

    return () => clearInterval(interval)
  }, [room.id, playerId])

  const handleHandSubmitted = async () => {
    // Refresh room after hand submission
    try {
      const response = await client.get(`/rooms/${room.id}`)
      setUpdatedRoom(response.data)
    } catch (err) {
      console.error('Failed to refresh room')
    }
  }

  const handleLeaveGame = async () => {
    setLoading(true)
    try {
      if (playerId) {
        await client.delete(`/rooms/${room.id}/players/${playerId}`)
      }
      onLeave()
    } catch (err) {
      console.error('Failed to leave game')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="game-board">
      <div className="game-header">
        <h2>Room: {updatedRoom.id}</h2>
        <p>Round: {updatedRoom.current_round}</p>
      </div>

      <div className="scoreboard">
        <h3>Scores</h3>
        <div className="scores-grid">
          {updatedRoom.players.map((player) => (
            <div key={player.id} className={`score-card ${player.name === playerName ? 'current' : ''}`}>
              <p className="player-name">{player.name}</p>
              <p className="player-score">{player.score}</p>
            </div>
          ))}
        </div>
      </div>

      {playerId && (
        <HandSubmissionForm 
          room={updatedRoom}
          playerId={playerId}
          playerName={playerName}
          onHandSubmitted={handleHandSubmitted}
        />
      )}

      <div className="game-actions">
        <button onClick={handleLeaveGame} disabled={loading}>
          Leave Game
        </button>
      </div>
    </div>
  )
}

export default GameBoard