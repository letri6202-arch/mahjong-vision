import { useState } from 'react'
import client from '../api/client'
import '../styles/JoinRoom.css'

function JoinRoom({ onRoomCreated, onRoomJoined }) {
  const [playerName, setPlayerName] = useState('')
  const [roomId, setRoomId] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!playerName.trim()) {
      setError('Please enter your name') 
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await client.post('/rooms', {
        created_by: playerName
      })
      onRoomCreated(response.data)
    } catch (err) {
      setError('Failed to create room')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinRoom = async (e) => {
    e.preventDefault()
    if (!playerName.trim() || !roomId.trim()) {
      setError('Please enter your name and room ID')
      return
    }

    setLoading(true)
    setError('')
    try {
      const response = await client.post(`/rooms/${roomId}/players`, {
        name: playerName
      })
      onRoomJoined(response.data)
    } catch (err) {
      setError('Failed to join room')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="join-room">
      <div className="form-container">
        <h2>Mahjong Vision</h2>
        
        <input
          type="text"
          placeholder="Enter your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          disabled={loading}
        />

        <button onClick={handleCreateRoom} disabled={loading}>
          {loading ? 'Loading...' : 'Create New Room'}
        </button>

        <p>OR</p>

        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={loading}
        />

        <button onClick={handleJoinRoom} disabled={loading}>
          {loading ? 'Loading...' : 'Join Room'}
        </button>

        {error && <div className="error">{error}</div>}
      </div>
    </div>
  )
}

export default JoinRoom