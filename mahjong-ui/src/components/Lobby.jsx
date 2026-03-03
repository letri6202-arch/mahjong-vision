import { useState, useEffect } from 'react'
import client from '../api/client'
import '../styles/Lobby.css'

const WINDS = ['E', 'S', 'W', 'N']

function Lobby({ room, playerName, onLeave }) {
  const [updatedRoom, setUpdatedRoom] = useState(room)
  const [loading, setLoading] = useState(false)
  const [playerId, setPlayerId] = useState(null)
  const [selectedWind, setSelectedWind] = useState(null)
  
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
    }, 2000)

    return () => clearInterval(interval)
  }, [room.id, playerId])

  const handleToggleReady = async () => {
    if (!playerId) return
    setLoading(true)
    try {
      const response = await client.post(`/rooms/${room.id}/players/${playerId}/ready`)
      setUpdatedRoom(response.data)
    } catch (err) {
      console.error('Failed to toggle ready')
    } finally {
      setLoading(false)
    }
  }

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

  const currentPlayer = updatedRoom.players.find(p => p.name === playerName)
  const isReady = currentPlayer?.ready || false
  const playerWind = currentPlayer?.wind || null

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
            <li key={player.id} className={player.ready ? 'ready' : ''}>
              {player.name} - Score: {player.score} - Wind: {player.wind || 'None'}
              {player.ready && <span className="badge">✓ Ready</span>}
            </li>
          ))}
        </ul>
      </div>

      <div className="wind-selection">
            <label className="section-label">Select the Round Wind</label>
            <div className="wind-options">
              {['E', 'S', 'W', 'N'].map(roundWind => (
                <label key={roundWind}>
                  <input
                    type="radio"
                    name="round-wind"
                    value={roundWind}
                    checked={updatedRoom.round_wind === roundWind}
                    onChange={async (e) => {
                      setLoading(true);
                      try {
                        const response = await client.post(
                          `/rooms/${room.id}/players/${playerId}/set_round_wind`,
                          { wind: roundWind }
                        );
                        setUpdatedRoom(response.data);
                        setSelectedWind(roundWind);
                      } catch (err) {
                        console.error('Failed to set wind');
                      } finally {
                        setLoading(false);
                      }
                    }}
                  />
                  <span>{roundWind === 'E' ? 'East' : roundWind === 'S' ? 'South' : roundWind === 'W' ? 'West' : 'North'}</span>
                </label>
              ))}
            </div>
          </div>
        <p>Current Round Wind: {updatedRoom.round_wind || 'None'}</p>        
      {updatedRoom.round_wind === null && <p className="warning">Please select the Round wind before readying up.</p>}

      {/* Wind Selection */}
      <div className="wind-selection">
        <h3>Select Your Wind</h3>
        <div className="wind-options">
          {WINDS.map((wind) => (
            <button
              key={wind}
              onClick={async () => {
                const prevWind = playerWind;
                if (!playerId) return;
                setLoading(true);
                try {
                  const response = await client.post(`/rooms/${room.id}/players/${playerId}/set_player_wind`, { wind , prevWind});
                  setUpdatedRoom(response.data);
                  setSelectedWind(wind);
                } catch (err) {
                  console.error('Failed to set wind');
                } finally {
                  setLoading(false);
                }
              }}
              className={playerWind === wind ? 'selected' : ''}
              disabled={
                (updatedRoom.selected_winds &&
                updatedRoom.selected_winds[wind] !== null &&
                updatedRoom.selected_winds[wind] !== playerId) || !updatedRoom.round_wind
              }
            >
              {wind === 'E' ? 'East' : wind === 'S' ? 'South' : wind === 'W' ? 'West' : 'North'}
            </button>
          ))}
        </div>
      </div>
      
      <p>Your selected wind: {playerWind || 'None'}</p>
      {!updatedRoom.round_wind && <p className="warning">Please select the Round Wind before selecting your player wind</p>}
      {playerWind === null && updatedRoom.round_wind && <p className="warning">Please select your wind before readying up.</p>}
      {/* <p>updatedRoom.selected_winds: {JSON.stringify(updatedRoom.selected_winds)}</p> */}

      <div className="lobby-actions">
        <button
          onClick={handleToggleReady}
          disabled={loading || !playerWind || !updatedRoom.round_wind}
          className={isReady ? 'ready' : ''}
        >
          {loading ? 'Loading...' : (isReady ? 'Not Ready' : 'Ready')}
        </button>
        <button
          onClick={handleLeaveRoom}
          disabled={loading}
        >
          {loading ? 'Leaving...' : 'Leave Room'}
        </button>
      </div>
    </div>
  )
}

export default Lobby