import { useState } from 'react'
import client from '../api/client'
import '../styles/HandSubmissionForm.css'

const TILES = ['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
               '1p', '2p', '3p', '4p', '5p', '6p', '7p', '8p', '9p',
               '1s', '2s', '3s', '4s', '5s', '6s', '7s', '8s', '9s',
               '5pr','5mr','5sr', 'E', 'S', 'W', 'N', 'C', 'D', 'B']

// Map tile codes to image filenames
const tileImageMap = {
  '1m': 'Man1.png', '2m': 'Man2.png', '3m': 'Man3.png', '4m': 'Man4.png', '5m': 'Man5.png',
  '6m': 'Man6.png', '7m': 'Man7.png', '8m': 'Man8.png', '9m': 'Man9.png',
  '1p': 'Pin1.png', '2p': 'Pin2.png', '3p': 'Pin3.png', '4p': 'Pin4.png', '5p': 'Pin5.png',
  '6p': 'Pin6.png', '7p': 'Pin7.png', '8p': 'Pin8.png', '9p': 'Pin9.png',
  '1s': 'Sou1.png', '2s': 'Sou2.png', '3s': 'Sou3.png', '4s': 'Sou4.png', '5s': 'Sou5.png',
  '6s': 'Sou6.png', '7s': 'Sou7.png', '8s': 'Sou8.png', '9s': 'Sou9.png',
  '5mr': 'Man5-Dora.png',
  '5pr': 'Pin5-Dora.png',
  '5sr': 'Sou5-Dora.png',
  'E': 'Ton (E).png',
  'S': 'Nan (S).png',
  'W': 'Shaa (W).png',
  'N': 'Pei (N).png',
  'C': 'Chun (Red Dragon).png',
  'D': 'Hatsu (Green Dragon).png',
  'B': 'Haku (White Dragon).png'
}
  const fiveCounts = {
    'm': 0,
    'p': 0,
    's': 0
  }
function HandSubmissionForm({ room, playerId, playerName, onHandSubmitted }) {
  const [tileCounts, setTileCounts] = useState({})
  const [winType, setWinType] = useState('discard')
  const [points, setPoints] = useState('')
  const [payments, setPayments] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Initialize payments for losers
  const losers = room.players.filter(p => p.id !== playerId)



  const handleTileIncrement = (tile) => {
    setTileCounts(prev => {
      const current = prev[tile] || 0
      if (['5mr', '5pr', '5sr'].includes(tile)) {
        if (current < 1) {
          if (tile==='5mr' && fiveCounts['m'] < 4) {
            fiveCounts['m'] = fiveCounts['m'] + 1
            return { ...prev, [tile]: Math.min(current + 1, 1) }
          }
          else if (tile==='5pr' && fiveCounts['p'] < 4) {
            fiveCounts['p'] = fiveCounts['p'] + 1
          }
          else if (tile==='5sr' && fiveCounts['s'] < 4) {
            fiveCounts['s'] = fiveCounts['s'] + 1
          }
          return { ...prev, [tile]: Math.min(current + 1, 1) }
        }
      } 
      else if (['5m', '5p', '5s'].includes(tile)) {
        if (current < 4) {
          if (tile==='5m' && fiveCounts['m'] < 4) {
            fiveCounts['m'] = fiveCounts['m'] + 1
          }
          else if (tile==='5p' && fiveCounts['p'] < 4) {
            fiveCounts['p'] = fiveCounts['p'] + 1
          }
          else if (tile==='5s' && fiveCounts['s'] < 4) {
            fiveCounts['s'] = fiveCounts['s'] + 1
          }
        }
        return { ...prev, [tile]: Math.min(current + 1, 4) }
      }
      else if (current < 4) {
        return { ...prev, [tile]: current + 1 }
      }
      return prev
    })
  }

  const handleTileDecrement = (tile) => {
    setTileCounts(prev => {
      const current = prev[tile] || 0
      if (['5mr', '5pr', '5sr'].includes(tile)) {
        if (current > 0) {
          // Decrement the corresponding five count
          if (tile==='5mr' && fiveCounts['m'] > 0) {
            fiveCounts['m'] = Math.max(0, fiveCounts['m'] - 1)
          }
          else if (tile==='5pr' && fiveCounts['p'] > 0) {
            fiveCounts['p'] = Math.max(0, fiveCounts['p'] - 1)
          }
          else if (tile==='5sr' && fiveCounts['s'] > 0) {
            fiveCounts['s'] = Math.max(0, fiveCounts['s'] - 1)
          }
          return { ...prev, [tile]: current - 1 }
        }
      }
      else if (['5m', '5p', '5s'].includes(tile)) {
        if (current > 0) {
          // Decrement the corresponding five count
          if (tile==='5m' && fiveCounts['m'] > 0) {
            fiveCounts['m'] = Math.max(0, fiveCounts['m'] - 1)
          }
          else if (tile==='5p' && fiveCounts['p'] > 0) {
            fiveCounts['p'] = Math.max(0, fiveCounts['p'] - 1)
          }
          else if (tile==='5s' && fiveCounts['s'] > 0) {
            fiveCounts['s'] = Math.max(0, fiveCounts['s'] - 1)
          }
          return { ...prev, [tile]: current - 1 }
        }
      } 
      else if (current > 0) {
        return { ...prev, [tile]: current - 1 }
      }
      return prev
    })
  }

  const handlePaymentChange = (loserId, value) => {
    setPayments(prev => ({
      ...prev,
      [loserId]: parseInt(value) || 0
    }))
  }

  const getSelectedTiles = () => {
    const tiles = []
    Object.entries(tileCounts).forEach(([tile, count]) => {
      for (let i = 0; i < count; i++) {
        tiles.push(tile)
      }
    })
    return tiles
  }

  const getTotalTiles = () => {
    return Object.values(tileCounts).reduce((sum, count) => sum + count, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!points || parseInt(points) <= 0) {
      setError('Points must be greater than 0')
      return
    }

    // Verify all losers have payment amounts
    for (let loser of losers) {
      if (!payments[loser.id]) {
        setError('Enter payment amount for all players')
        return
      }
    }

    setLoading(true)
    setError('')
    try {
      await client.post(`/rooms/${room.id}/hands`, {
        winner_id: playerId,
        hand_data: {
          tiles: getSelectedTiles(),
          win_type: winType,
          points: parseInt(points),
          payments: payments
        }
      })
      onHandSubmitted()
      // Reset form
      setTileCounts({})
      setPoints('')
      setPayments({})
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit hand')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="hand-submission-form">
      <h3>Submit Winning Hand</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <label>Tiles (max 4 of each)</label>
          <div className="tiles-grid">
            {TILES.map(tile => {
              const count = tileCounts[tile] || 0
              const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`
              return (
                <div className="tile-counter">
                <div className="tile-display">
                    <img src={imagePath} alt={tile} className="tile-image" />
                    <span className="tile-count">{count}</span>
                </div>
                <div className="tile-buttons">
                    <button
                    type="button"
                    className="tile-minus"
                    onClick={() => handleTileDecrement(tile)}
                    disabled={count === 0}
                    >
                    −
                    </button>
                    <button
                    type="button"
                    className="tile-plus"
                    onClick={() => handleTileIncrement(tile)}
                    disabled={count === 4 
                      || (['5mr', '5pr', '5sr'].includes(tile) && count === 1)
                      || (['5mr', '5pr', '5sr'].includes(tile) &&  fiveCounts[tile[1]] === 4)
                      || (tile=='5m' &&  fiveCounts[tile[1]] === 4)
                      || (tile=='5p' &&  fiveCounts[tile[1]] === 4)
                      || (tile=='5s' &&  fiveCounts[tile[1]] === 4)
                    }
                    >
                    +
                    </button>
                </div>
                </div>
              )
            })}
          </div>
          <p className="selected-tiles">Total tiles: {getTotalTiles()} | Selected: {getSelectedTiles().join(', ') || 'None'}</p>
        </div>
        <div className="5counts">
          <p>5m count: {fiveCounts['m']}</p>
          <p>5p count: {fiveCounts['p']}</p>
          <p>5s count: {fiveCounts['s']}</p>
        </div>
        <div className="form-section">
          <label htmlFor="win-type">Win Type</label>
          <select 
            id="win-type"
            value={winType} 
            onChange={(e) => setWinType(e.target.value)}
          >
            <option value="discard">Ron</option>
            <option value="self-draw">Tsumo</option>
          </select>
        </div>

        <div className="form-section">
          <label htmlFor="points">Total Points</label>
          <input
            id="points"
            type="number"
            value={points}
            onChange={(e) => setPoints(e.target.value)}
            placeholder="Enter total points"
            min="1"
          />
        </div>

        <div className="form-section">
          <label>Payment from Each Player</label>
          {losers.map(loser => (
            <div key={loser.id} className="payment-input">
              <span>{loser.name}</span>
              <input
                type="number"
                value={payments[loser.id] || ''}
                onChange={(e) => handlePaymentChange(loser.id, e.target.value)}
                placeholder="Points paid"
                min="0"
              />
            </div>
          ))}
        </div>

        {error && <div className="error">{error}</div>}

        <button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Hand'}
        </button>
      </form>
    </div>
  )
}

export default HandSubmissionForm