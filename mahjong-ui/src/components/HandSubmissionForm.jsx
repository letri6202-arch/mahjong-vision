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
  //Game State Information
  const [winType, setWinType] = useState('discard')
  const [points, setPoints] = useState('')
  const [payments, setPayments] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  //Tile information
  const [tileCounts, setTileCounts] = useState({})  
  const [winningTile, setWinningTile] = useState(null)

  //Wind selections
  const [playerWind, setPlayerWind] = useState('E')  // Default to East
  const [roundWind, setRoundWind] = useState('E')  // Default to East

  //Variables for additional hand information
  const [isTsumo, setIsTsumo] = useState(false)
  const [isRiichi, setIsRiichi] = useState(false)
  const [isIppatsu, setIsIppatsu] = useState(false)
  const [isRinshan, setIsRinshan] = useState(false)
  const [isChankan, setIsChankan] = useState(false)
  const [isHaitei, setIsHaitei] = useState(false)
  const [isHoutei, setIsHoutei] = useState(false)
  const [isDaburuRiichi, setIsDaburuRiichi] = useState(false)
  const [isNagashiMangan, setIsNagashiMangan] = useState(false)
  const [isTenhou, setIsTenhou] = useState(false)
  const [isRenhou, setIsRenhou] = useState(false)
  const [isChiihou, setIsChiihou] = useState(false)

  const sessionPlayer = room.players.find(p => p.id === playerId)

  //Player information
  const [isDealer, setIsDealer] = useState(sessionPlayer.wind == room.roundWind) // This can be determined based on playerWind and roundWind
  const [discardingPlayer, setDiscardingPlayer] = useState(null) // This can be determined based on winType and playerWind
  //Dora indicators
  const [doraIndicators, setDoraIndicators] = useState([])
  
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
    
    const tiles = getSelectedTiles()
    
    // Require a winning tile to submit a hand
    if (!winningTile) {
      setError('Please select a winning tile')
      return
    }

    //Validate that the winning tile is among the selected tiles
    if (winningTile && !tiles.includes(winningTile)) {
      setError('Winning tile must be among the selected tiles')
      return
    }

    setLoading(true)
    setError('')
    try {
      await client.post(`/rooms/${room.id}/hands`, {
        winner_id: playerId,
        hand_data: {
          tiles: getSelectedTiles(),
          win_type: winType,
          winningTile: winningTile,
          config: {
            is_tsumo: isTsumo,
            is_riichi: isRiichi,
            is_ippatsu: isIppatsu,
            is_rinshan: isRinshan,
            is_chankan: isChankan,
            is_haitei: isHaitei,
            is_houtei: isHoutei,
            is_daburu_riichi: isDaburuRiichi,
            is_nagashi_mangan: isNagashiMangan,
            is_tenhou: isTenhou,
            is_renhou: isRenhou,
            is_chiihou: isChiihou,
            player_wind: sessionPlayer.wind,
            round_wind: room.roundWind,
          },
          isDealer: sessionPlayer.wind == room.roundWind,
          discarderId: discardingPlayer
        }
      })
      onHandSubmitted()
      // Reset form
      setTileCounts({})
      setPoints('')
      setPayments({})
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to submit hand'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleWinningTile = (tile) => {
    setWinningTile(prev => prev === tile ? null : tile)
  }

  return (
    <div className="hand-submission-form">
      <h3 className="section-label">Submit Winning Hand</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Select your Tiles (max 4 of each)</h3>
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
                      style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                      <img src="/minus-unpressed.png" alt="-" style={{ width: 24, height: 24 }} />
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
                      style={{ background: 'none', border: 'none', padding: 0 }}
                    >
                      <img src="/plus-unpressed.png" alt="+" style={{ width: 24, height: 24 }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="tile-summary">
            <label className ="selected-tiles-label">Selected Tiles</label>
            {
              getSelectedTiles().length <= 0 && ( <p className="no-tiles">No tiles selected</p>)
            }
            <p className="selected-tiles">
              Total tiles: {getTotalTiles()}
            </p>
            <div className="tile-summary-selected">
              {getSelectedTiles().map((tile, index) => {
                return (
                  <img 
                    key={index}
                    src={`/Tile_PNGs/${tileImageMap[tile]}`}
                    alt={tile}
                    className="tile-image-selected"
                    onClick={() => handleTileDecrement(tile)}
                  />
                )
              })}
            </div>
          </div>
        </div>

        {/* <div className="5counts">
          <p> For debugging purposes</p>
          <p>5m count: {fiveCounts['m']}</p>
          <p>5p count: {fiveCounts['p']}</p>
          <p>5s count: {fiveCounts['s']}</p>
          <p>Player is dealer: {isDealer ? 'Yes' : 'No'}</p>
        </div> */}
        <hr></hr>         

        <div className="form-section">
          <p className="section-label">Select the winning tile (click to select/deselect)</p>
          <div className="tiles-grid">
            {TILES.map(tile => {
              const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`
              const isSelected = winningTile === tile
              return (
                <div
                  key={tile}
                  className={`tile-counter ${isSelected ? 'winning-tile-selected' : ''}`}
                  onClick={() => handleWinningTile(tile)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="tile-display">
                    <img src={imagePath} alt={tile} className="tile-image" />
                  </div>
                </div>
              )
            })}
          </div>
          <p className="section-label">Winning Tile</p>

          {
            !winningTile && ( <p className="no-winning-tile">No winning tile selected</p>)
          }

          {winningTile && (
            <div className="winning-tile-display">
              <p>Selected: {winningTile}</p>
              <img
                src={`/Tile_PNGs/${tileImageMap[winningTile]}`}
                alt={winningTile}
                className="tile-image"
              />
            </div>
          )}
        </div>

        <div className="form-section">
          <label className='section-label'>Win Type</label>
          <div className="additional-info">
            <label>
              <input 
                type="checkbox"
                checked={isTsumo}
                onChange={(e) => setIsTsumo(e.target.checked)}
              />
              <span>Tsumo (Self-Draw)</span>
            </label>
            </div>

            <div className="discarding-player-select">
              <label className="section-label">Player Who Discarded</label>
                <div className="wind-options">
                  {losers.map(player => (
                      <label key={player.id}>
                        <input
                          type="radio"
                          name="discarding-player"
                          value={player.id}
                          checked={discardingPlayer === player.id}
                          onChange={(e) => setDiscardingPlayer(e.target.value)}
                        />
                        <span>{player.name}</span>
                    </label>
                  ))}
                </div>
            </div>  
              

          <label className="section-label">Basic Options</label>
          <div className="additional-info">
            <label>
              <input
                type="checkbox"
                checked={isRiichi}
                onChange={(e) => setIsRiichi(e.target.checked)}
              />
              <span>Riichi</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isIppatsu}
                onChange={(e) => setIsIppatsu(e.target.checked)}
              />
              <span>Ippatsu</span>
            </label>

          </div>

          <label className="section-label">Advanced Options</label>
          <div className="additional-info">
            <label>
              <input
                type="checkbox"
                checked={isRinshan}
                onChange={(e) => setIsRinshan(e.target.checked)}
              />
              <span>Rinshan</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isChankan}
                onChange={(e) => setIsChankan(e.target.checked)}
              />
              <span>Chankan</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isHaitei}
                onChange={(e) => setIsHaitei(e.target.checked)}
              />
              <span>Haitei</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isHoutei}
                onChange={(e) => setIsHoutei(e.target.checked)}
              />
              <span>Houtei</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isDaburuRiichi}
                onChange={(e) => setIsDaburuRiichi(e.target.checked)}
              />
              <span>Daburu Riichi</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isNagashiMangan}
                onChange={(e) => setIsNagashiMangan(e.target.checked)}
              />
              <span>Nagashi Mangan</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isTenhou}
                onChange={(e) => setIsTenhou(e.target.checked)}
              />
              <span>Tenhou</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isRenhou}
                onChange={(e) => setIsRenhou(e.target.checked)}
              />
              <span>Renhou</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={isChiihou}
                onChange={(e) => setIsChiihou(e.target.checked)}
              />
              <span>Chiihou</span>
            </label>
          </div>
        </div>

        <div className="submit-button-container">
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Submitting...' : 'Submit Hand'}
          </button>
        </div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}

export default HandSubmissionForm