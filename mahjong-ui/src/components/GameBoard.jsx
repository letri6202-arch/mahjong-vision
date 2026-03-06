import { useState, useEffect } from 'react'
import client from '../api/client'
import HandSubmissionForm from './HandSubmissionForm'
import '../styles/Gameboard.css'

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
        <p>Round Wind: {updatedRoom.round_wind || 'None'}</p>
        <p>Player: {playerName}</p>
        <p>Player Wind: {updatedRoom.players.find(p => p.name === playerName)?.wind || 'None'}</p>
        <p>Am I the dealer? {updatedRoom.players.find(p => p.name === playerName)?.is_dealer ? 'Yes' : 'No'}</p>
      </div>

      <div className="scoreboard">
        <h3>Scores</h3>
        <div className="scores-grid">
          {[...updatedRoom.players]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((player) => (
              <div key={player.id} className={`score-scroll ${player.name === playerName ? 'current' : ''}`}>
                <div className="scroll-bg">
                  <p className="player-name-scroll">{player.name}</p>
                  <p className="player-score-scroll">{player.score}</p>
                  <p className="player-wind-scroll">{player.wind}</p>
                  {player.is_winner && <span className="winner-scroll">Winner</span>}
                </div>
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
        <button className="leave-game-button" onClick={handleLeaveGame} disabled={loading}>
          Leave Game
        </button>
      </div>
    </div>
  )
}

export default GameBoard