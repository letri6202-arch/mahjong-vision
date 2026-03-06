import { useState, useEffect } from 'react'
import client from '../api/client'
import '../styles/Lobby.css'

const WINDS = ['E', 'S', 'W', 'N']

function Lobby({ room, playerName, onLeave }) {
  const [updatedRoom, setUpdatedRoom] = useState(room)
  const [loading, setLoading] = useState(false)
  const [playerId, setPlayerId] = useState(null)
  const [selectedWind, setSelectedWind] = useState(null)

  // Helper to parse selected_winds
  const getSelectedWinds = (room) => {
    if (!room.selected_winds) return { E: null, S: null, W: null, N: null };
    if (typeof room.selected_winds === 'string') {
      try {
        return JSON.parse(room.selected_winds);
      } catch {
        return { E: null, S: null, W: null, N: null };
      }
    }
    return room.selected_winds;
  };

  const selectedWinds = getSelectedWinds(updatedRoom);

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

  // Sort players by name (case-insensitive)
  const sortedPlayers = [...updatedRoom.players].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
  );

  return (
    <div className="lobby">
      <div className="room-info">
        <h2>Room: {updatedRoom.id}</h2>
        <p>Status: {updatedRoom.status}</p>
        <p>Players: {updatedRoom.players.length}/{updatedRoom.max_players}</p>
      </div>

      <div className="players-list">
        <h3>Players</h3>
        <div className="player-cards">
          {sortedPlayers.map((player) => (
            <div className="player-card" key={player.id}>
              <div className="player-card-content">
                <div className="player-name">{player.name}</div>
                <div className="player-wind">{player.wind || 'No Wind'}</div>
                <div className="player-ready-indicator">
                  {player.ready ? <span className="ready-indicator">🟢</span> : <span className="not-ready-indicator">🔴</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="wind-selection">
        <label className="section-label">Select the Round Wind</label>
        <div className="wind-options">
          {WINDS.map(roundWind => (
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
      {updatedRoom.round_wind === null && <p className="warning">Please select the Round wind before readying up.</p>}

      {/* Wind Selection */}
      <div className="wind-selection">
        <label className="section-label">Select Your Wind</label>
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
                (selectedWinds[wind] !== null && selectedWinds[wind] !== playerId) || !updatedRoom.round_wind
              }
            >
              {wind === 'E' ? 'East' : wind === 'S' ? 'South' : wind === 'W' ? 'West' : 'North'}
            </button>
          ))}
        </div>
      </div>

      {!updatedRoom.round_wind && <p className="warning">Please select the Round Wind before selecting your player wind</p>}
      {playerWind === null && updatedRoom.round_wind && <p className="warning">Please select your wind before readying up.</p>}

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