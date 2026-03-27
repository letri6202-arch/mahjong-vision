import { useState } from 'react'
import '../styles/PlayerNamesForm.css'

function PlayerNamesForm({ onSubmit }) {
  const [names, setNames] = useState(['', '', '', ''])
  const [error, setError] = useState('')

  const handleChange = (idx, value) => {
    const updated = [...names]
    updated[idx] = value
    setNames(updated)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (names.some(name => !name.trim())) {
      setError('Please enter all 4 names.')
      return
    }
    setError('')
    onSubmit(names)
  }

  return (
    <div className="player-names-form">
      {/* Optional: Uncomment for blurred background effect */}
      {/* <div className="player-names-form-background" /> */}
      <div className="player-names-container">
        <h2>Enter 4 Player Names</h2>
        <form onSubmit={handleSubmit}>
          {names.map((name, idx) => (
            <input
              key={idx}
              type="text"
              placeholder={`Player ${idx + 1}`}
              value={name}
              onChange={e => handleChange(idx, e.target.value)}
              maxLength={8}
              required
            />
          ))}
          <button type="submit">Start Game</button>
          {error && <div className="error">{error}</div>}
        </form>
      </div>
    </div>
  )
}

export default PlayerNamesForm
