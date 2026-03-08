import { useState } from 'react'
import { Tooltip } from 'react-tooltip'
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

// Helper to count normal and red 5s for each suit from tileCounts
function getFiveCounts(tileCounts) {
  return {
    m: {
      normal: tileCounts['5m'] || 0,
      red: tileCounts['5mr'] || 0
    },
    p: {
      normal: tileCounts['5p'] || 0,
      red: tileCounts['5pr'] || 0
    },
    s: {
      normal: tileCounts['5s'] || 0,
      red: tileCounts['5sr'] || 0
    }
  }
}

function HandSubmissionForm({ room, playerId, playerName, onHandSubmitted }) {
        // Meld selection state
        // Dynamic melds: each meld is an array of tile indices
        const [ponMelds, setPonMelds] = useState([]); // array of arrays
        const [chiMelds, setChiMelds] = useState([]);
        const [kanMelds, setKanMelds] = useState([]);
      // Yaku descriptions for tooltips (from Yaku.md)
      const yakuDescriptions = {
        'Riichi': 'Declare riichi when tenpai with a closed hand, discarding face-down. Closed only.',
        'DaburuRiichi': 'Riichi declared on your very first discard of the game. Closed only.',
        'OpenRiichi': 'Riichi variant where you reveal your hand. Rare/optional rule. Closed only.',
        'DaburuOpenRiichi': 'Open riichi declared on the first turn. Reveals hand. Closed only.',
        'Ippatsu': 'Win within one full round of turns after declaring riichi, before any calls interrupt.',
        'Tsumo': 'Win by self-draw with a closed hand. Closed only.',
        'Pinfu': 'Four sequences, a non-yakuhai pair, and a two-sided (ryanmen) wait. Closed only.',
        'Tanyao': 'All tiles are simples (2–8); no terminals or honors.',
        'Iipeiko': 'Two identical sequences in a closed hand. Closed only.',
        'Ryanpeikou': 'Two pairs of identical sequences (double iipeiko). Closed only.',
        'Chiitoitsu': 'Seven different pairs. Fixed fu of 25. Closed only.',
        'Toitoi': 'All four melds are triplets; no sequences.',
        'San Ankou': 'Three concealed triplets. The fourth meld may be open. Closed only.',
        'Sanshoku': 'Three sequences of the same number across all three suits.',
        'SanshokuDoukou': 'Three triplets of the same number across all three suits.',
        'Ittsu': 'A 1–2–3, 4–5–6, and 7–8–9 sequence all in the same suit.',
        'Honitsu': 'Hand uses only one suit plus honor tiles.',
        'Chinitsu': 'Hand uses only one suit; no honors.',
        'Honroto': 'All tiles are terminals (1s/9s) or honors, all melds are triplets/pairs. Stacks with Toitoi/Chiitoitsu.',
        'Junchan': 'Every meld and the pair contain a terminal (1 or 9).',
        'Chantai': 'Every meld and the pair contain a terminal or honor.',
        'Shosangen': 'Two triplets of dragon tiles plus a pair of the third dragon.',
        'SanKantsu': 'Three kans declared in the hand.',
        'Haku': 'Triplet of white dragons (中).',
        'Hatsu': 'Triplet of green dragons (發).',
        'Chun': 'Triplet of red dragons (中).',
        'SeatWindEast': 'Triplet of your seat wind — East.',
        'SeatWindSouth': 'Triplet of your seat wind — South.',
        'SeatWindWest': 'Triplet of your seat wind — West.',
        'SeatWindNorth': 'Triplet of your seat wind — North.',
        'RoundWindEast': 'Triplet of the current round wind — East.',
        'RoundWindSouth': 'Triplet of the current round wind — South.',
        'RoundWindWest': 'Triplet of the current round wind — West.',
        'RoundWindNorth': 'Triplet of the current round wind — North.',
        'Haitei': 'Win by tsumo on the very last drawable tile.',
        'Houtei': 'Win by ron on the discard after the last drawable tile.',
        'Rinshan': 'Win by tsumo on the supplemental tile drawn after declaring a kan.',
        'Chankan': 'Win by robbing a kan — stealing the tile someone adds to an open triplet to complete a kan.',
        'NagashiMangan': 'All of your discards were terminals or honors, and none were called. Scored as mangan at round end.',
        'Renhou': 'Win by ron before your first draw (within the first round of turns). *Scored as mangan or yakuman depending on ruleset.',
        'Menzen Tsumo': 'Win by self-draw with a closed hand. Closed only.'
        // Add more yaku descriptions as needed
      };
  // State for open/closed hand
  const [isHandOpen, setIsHandOpen] = useState(false);
    // Winning hand info state
    const [winningHandInfo, setWinningHandInfo] = useState(null)
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
      const fiveCounts = getFiveCounts(prev)
      if (["5mr", "5pr", "5sr"].includes(tile)) {
        const suit = tile[1]
        // Only allow 1 red 5, and total 5s (red + normal) <= 4
        if (current < 1 && fiveCounts[suit].normal + fiveCounts[suit].red < 4) {
          return { ...prev, [tile]: 1 }
        }
      } else if (["5m", "5p", "5s"].includes(tile)) {
        const suit = tile[1]
        // Allow up to 4 non-red 5s, but total (red + normal) <= 4
        if (current < 4 && fiveCounts[suit].normal + fiveCounts[suit].red < 4) {
          return { ...prev, [tile]: current + 1 }
        }
      } else if (current < 4) {
        return { ...prev, [tile]: current + 1 }
      }
      return prev
    })
  }

  const handleTileDecrement = (tile) => {
    setTileCounts(prev => {
      const current = prev[tile] || 0
      if (["5mr", "5pr", "5sr"].includes(tile)) {
        if (current > 0) {
          return { ...prev, [tile]: 0 }
        }
      } else if (["5m", "5p", "5s"].includes(tile)) {
        if (current > 0) {
          return { ...prev, [tile]: current - 1 }
        }
      } else if (current > 0) {
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
        // Build melds_data for point calculation
        function buildMeldsData() {
          const tiles = getSelectedTiles();
          const melds = [];
          ponMelds.forEach(meld => {
            if (meld.length === 3) {
              melds.push({ type: 'pon', tiles: meld.map(idx => tiles[idx]) , opened:true});
            }
          });
          chiMelds.forEach(meld => {
            if (meld.length === 3) {
              melds.push({ type: 'chi', tiles: meld.map(idx => tiles[idx]) , opened:true});
            }
          });
          kanMelds.forEach(meld => {
            if (meld.length === 4) {
              melds.push({ type: 'kan', tiles: meld.map(idx => tiles[idx]) , opened:true});
            }
          });
          return melds;
        }

    setLoading(true)
    setError('')
        // Convert melds from indices to tile arrays
        function meldsToTiles(melds, meldSize) {
          const tiles = getSelectedTiles();
          return melds
            .filter(meld => meld.length === meldSize)
            .map(meld => meld.map(idx => tiles[idx]));
        }
        const ponMeldsTiles = meldsToTiles(ponMelds, 3);
        const chiMeldsTiles = meldsToTiles(chiMelds, 3);
        const kanMeldsTiles = meldsToTiles(kanMelds, 4);
    // Debug print melds
    console.log('pon_meld:', ponMelds);
    console.log('chi_meld:', chiMelds);
    console.log('kan_meld:', kanMelds);
   
    try {
          const melds_data = buildMeldsData();
          console.log('melds_data:', melds_data)
          const response = await client.post(`/rooms/${room.id}/hands`, {
            winner_id: playerId,
            hand_data: {
              tiles: getSelectedTiles(),
              win_type: winType,
              winningTile: winningTile,
              melds_data,
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
              discarderId: discardingPlayer,
              pon_meld: ponMeldsTiles,
              chi_meld: chiMeldsTiles,
              kan_meld: kanMeldsTiles
            }
          })
      // Extract winning hand info from response
      if (response.data && response.data.winning_hand_info) {
        setWinningHandInfo(response.data.winning_hand_info)
      } else {
        setWinningHandInfo(null)
      }
      onHandSubmitted()
      // Reset all form fields
      setTileCounts({})
      setPoints('')
      setPayments({})
      setWinningTile(null)
      setWinType('discard')
      setPlayerWind('E')
      setRoundWind('E')
      setIsTsumo(false)
      setIsRiichi(false)
      setIsIppatsu(false)
      setIsRinshan(false)
      setIsChankan(false)
      setIsHaitei(false)
      setIsHoutei(false)
      setIsDaburuRiichi(false)
      setIsNagashiMangan(false)
      setIsTenhou(false)
      setIsRenhou(false)
      setIsChiihou(false)
      setIsDealer(sessionPlayer.wind == room.roundWind)
      setDiscardingPlayer(null)
      setDoraIndicators([])
          setPonMelds([])
          setChiMelds([])
          setKanMelds([])
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

  // Group tiles by suit
  const manTiles = ['1m','2m','3m','4m','5m','5mr','6m','7m','8m','9m']
  const pinTiles = ['1p','2p','3p','4p','5p','5pr','6p','7p','8p','9p']
  const souTiles = ['1s','2s','3s','4s','5s','5sr','6s','7s','8s','9s']
  const honorTiles = ['E','S','W','N','C','D','B']

  return (
    <div className="hand-submission-form">
      <hr></hr>
      {winningHandInfo && (
        <div className="winning-hand-info">
          <p className='section-label'>Winning Hand Information</p> 
          <ul>
            <li><strong>Han:</strong> {winningHandInfo.han}</li>
            {winningHandInfo.fu !== null && <li><strong>Fu:</strong> {winningHandInfo.fu}</li>}
            <li><strong>Points:</strong> {winningHandInfo.points}</li>
            <li><strong>Main Payment:</strong> {winningHandInfo.main}</li>
            <li><strong>Additional Payment:</strong> {winningHandInfo.additional}</li>
            <li><strong>Yaku:</strong> {
              winningHandInfo.yaku && winningHandInfo.yaku.length > 0 ? (
                <span>
                  {winningHandInfo.yaku.map((yaku, idx) => (
                    <span key={yaku} style={{marginRight: '8px'}}>
                      <span
                        data-tooltip-id={`yaku-tip-${idx}`}
                        data-tooltip-content={yakuDescriptions[yaku] || 'No description available'}
                        style={{textDecoration: 'underline', cursor: 'pointer'}}
                      >{yaku}</span>
                      <Tooltip id={`yaku-tip-${idx}`} place="top" />
                    </span>
                  ))}
                </span>
              ) : 'None'
            }</li>
            {winningHandInfo.error && <li style={{color:'red'}}><strong>Error:</strong> {winningHandInfo.error}</li>}
          </ul>
        </div>
      )}
      <hr></hr>
      <h3 className="section-label">Submit Winning Hand</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <p className='subsection-label'>Select your Tiles (max 4 of each)</p>
          <div className="tile-row-container">
            <div className="tile-row"><span className="tile-row-label">Man</span>
              {manTiles.map(tile => {
                const count = tileCounts[tile] || 0
                const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`
                const fiveCounts = getFiveCounts(tileCounts)
                return (
                  <div className="tile-counter" key={tile}>
                    <div className="tile-display">
                      <img src={imagePath} alt={tile} className="tile-image" />
                      <span className="tile-count">{count}</span>
                    </div>
                    <div className="tile-buttons">
                      <button type="button" className="tile-minus" onClick={() => handleTileDecrement(tile)} disabled={count === 0} style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/minus-unpressed.png" alt="-" style={{ width: 24, height: 24 }} />
                      </button>
                      <button type="button" className="tile-plus" onClick={() => handleTileIncrement(tile)}
                        disabled={(() => {
                          if (["5mr"].includes(tile)) {
                            return count === 1 || fiveCounts['m'].normal + fiveCounts['m'].red >= 4
                          }
                          if (tile === '5m') {
                            return count === 4 || fiveCounts['m'].normal + fiveCounts['m'].red >= 4
                          }
                          return count === 4
                        })()}
                        style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/plus-unpressed.png" alt="+" style={{ width: 24, height: 24 }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="tile-row"><span className="tile-row-label">Pin</span>
              {pinTiles.map(tile => {
                const count = tileCounts[tile] || 0
                const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`
                const fiveCounts = getFiveCounts(tileCounts)
                return (
                  <div className="tile-counter" key={tile}>
                    <div className="tile-display">
                      <img src={imagePath} alt={tile} className="tile-image" />
                      <span className="tile-count">{count}</span>
                    </div>
                    <div className="tile-buttons">
                      <button type="button" className="tile-minus" onClick={() => handleTileDecrement(tile)} disabled={count === 0} style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/minus-unpressed.png" alt="-" style={{ width: 24, height: 24 }} />
                      </button>
                      <button type="button" className="tile-plus" onClick={() => handleTileIncrement(tile)}
                        disabled={(() => {
                          if (["5pr"].includes(tile)) {
                            return count === 1 || fiveCounts['p'].normal + fiveCounts['p'].red >= 4
                          }
                          if (tile === '5p') {
                            return count === 4 || fiveCounts['p'].normal + fiveCounts['p'].red >= 4
                          }
                          return count === 4
                        })()}
                        style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/plus-unpressed.png" alt="+" style={{ width: 24, height: 24 }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="tile-row"><span className="tile-row-label">Sou</span>
              {souTiles.map(tile => {
                const count = tileCounts[tile] || 0
                const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`
                const fiveCounts = getFiveCounts(tileCounts)
                return (
                  <div className="tile-counter" key={tile}>
                    <div className="tile-display">
                      <img src={imagePath} alt={tile} className="tile-image" />
                      <span className="tile-count">{count}</span>
                    </div>
                    <div className="tile-buttons">
                      <button type="button" className="tile-minus" onClick={() => handleTileDecrement(tile)} disabled={count === 0} style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/minus-unpressed.png" alt="-" style={{ width: 24, height: 24 }} />
                      </button>
                      <button type="button" className="tile-plus" onClick={() => handleTileIncrement(tile)}
                        disabled={(() => {
                          if (["5sr"].includes(tile)) {
                            return count === 1 || fiveCounts['s'].normal + fiveCounts['s'].red >= 4
                          }
                          if (tile === '5s') {
                            return count === 4 || fiveCounts['s'].normal + fiveCounts['s'].red >= 4
                          }
                          return count === 4
                        })()}
                        style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/plus-unpressed.png" alt="+" style={{ width: 24, height: 24 }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="tile-row"><span className="tile-row-label">Honors</span>
              {honorTiles.map(tile => {
                const count = tileCounts[tile] || 0
                const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`
                return (
                  <div className="tile-counter" key={tile}>
                    <div className="tile-display">
                      <img src={imagePath} alt={tile} className="tile-image" />
                      <span className="tile-count">{count}</span>
                    </div>
                    <div className="tile-buttons">
                      <button type="button" className="tile-minus" onClick={() => handleTileDecrement(tile)} disabled={count === 0} style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/minus-unpressed.png" alt="-" style={{ width: 24, height: 24 }} />
                      </button>
                      <button type="button" className="tile-plus" onClick={() => handleTileIncrement(tile)}
                        disabled={count === 4}
                        style={{ background: 'none', border: 'none', padding: 0 }}>
                        <img src="/plus-unpressed.png" alt="+" style={{ width: 24, height: 24 }} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <br></br>
          <div className="tile-summary">
            <label className ="subsection-label">Selected Tiles</label>
            <div style={{ marginBottom: '8px' }}>
              <button
                type="button"
                className="clear-tiles-button"
                onClick={() => setTileCounts({})}
                disabled={getSelectedTiles().length === 0}
              >
                Clear
              </button>
            </div>
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
          <p className="section-label">Select the winning tile</p>
          {getSelectedTiles().length > 0 && 
          <div className="tiles-row">
            {[...new Set(getSelectedTiles())].map((tile, index) => {
              const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
              const isSelected = winningTile === tile;
              return (
                <div
                  key={tile}
                  className={`tile-counter ${isSelected ? 'winning-tile-selected' : ''}`}
                  onClick={() => handleWinningTile(tile)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={imagePath} alt={tile} className="tile-image" />
                </div>
              );
            })}
          </div>
          }
          <p className="subsection-label">Winning Tile </p>

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
        <hr></hr>
        <div className="form-section">
          <label className='section-label'>Win Type</label>
          <div className="additional-info">
          <label>
            <input 
              type="checkbox"
              checked={isTsumo}
              onChange={(e) => {
                setIsTsumo(e.target.checked)
                setDiscardingPlayer(null)
              }}
              data-tooltip-id="tsumo-tip"
              data-tooltip-content="Tsumo: Win by self-draw. You draw the winning tile yourself."
            />
            <span data-tooltip-id="tsumo-tip" data-tooltip-content="Tsumo: Win by self-draw. You draw the winning tile yourself.">Tsumo (Self-Draw)</span>
            <Tooltip id="tsumo-tip" place="top" />
          </label>
       </div>

      {!isTsumo && (
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
      )}
              

          <label className="section-label">Basic Options</label>
          <div className="additional-info">
              <label>
              <input
                type="checkbox"
                checked={isHandOpen}
                onChange={(e) => {
                  setIsHandOpen(e.target.checked)
                  if (!e.target.checked) {
                    setPonMelds([]);
                    setChiMelds([]);
                    setKanMelds([]);
                  }
                }}
                data-tooltip-id="hand-open-tip"
                data-tooltip-content="Any of your melds are open/exposed"
              />
              <span data-tooltip-id="hand-open-tip" data-tooltip-content="Any of your melds are open/exposed">Open Hand</span>
              <Tooltip id="hand-open-tip" place="top" />
            </label>

            {isHandOpen && (
              <div className="meld-container">
                <p className="subsection-label">Your hand is open/exposed.</p>
                {/* Dynamic melds UI */}
                <div className="meld-row">
                  <label>Pon Melds:</label>
                  <div style={{fontSize:'12px',color:'#888',marginBottom:'4px'}}>Indices: {JSON.stringify(ponMelds)}</div>
                  {ponMelds.map((meld, meldIdx) => (
                    <div key={meldIdx} className="tiles-row meld-tiles-row" style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '6px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9', marginBottom: '8px', position:'relative' }}>
                      {/* Render tile selection for this meld */}
                      {meld.length < 3 ? (
                        <div style={{display:'inline-block'}}>
                          {getSelectedTiles().map((tile, idx) => {
                            // Prevent duplicate selection in this meld and across all melds
                            const allSelectedIndices = [
                              ...ponMelds.flat(),
                              ...chiMelds.flat(),
                              ...kanMelds.flat()
                            ];
                            const alreadySelected = meld.includes(idx);
                            const globallySelected = allSelectedIndices.includes(idx) && !alreadySelected;
                            const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                            return (
                              <div key={tile + '-pon-select-' + meldIdx + '-' + idx} className={`tile-counter ${(alreadySelected || globallySelected) ? 'winning-tile-selected' : ''}`}
                                style={{display:'inline-block',cursor:(alreadySelected||globallySelected)?'not-allowed':'pointer',opacity:(alreadySelected||globallySelected)?0.5:1}}
                                onClick={() => {
                                  if (!alreadySelected && !globallySelected && meld.length < 3) {
                                    setPonMelds(ponMelds.map((m,i)=>i===meldIdx?[...m,idx]:m));
                                  }
                                }}>
                                <img src={imagePath} alt={tile} className="tile-image" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        meld.map((idx, tileIdx) => {
                          const tile = getSelectedTiles()[idx];
                          const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                          return (
                            <div key={tile + '-pon-' + meldIdx + '-' + tileIdx} className="tile-counter">
                              <img src={imagePath} alt={tile} className="tile-image" />
                            </div>
                          );
                        })
                      )}
                      <button type="button" style={{position:'absolute',top:'4px',right:'4px',background:'#f44336',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',cursor:'pointer'}} onClick={() => setPonMelds(ponMelds.filter((_,i)=>i!==meldIdx))}>Delete</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setPonMelds([...ponMelds, []])} style={{margin:'4px'}}>+ Add Pon Meld</button>
                </div>
                <div className="meld-row">
                  <label>Chi Melds:</label>
                  <div style={{fontSize:'12px',color:'#888',marginBottom:'4px'}}>Indices: {JSON.stringify(chiMelds)}</div>
                  {chiMelds.map((meld, meldIdx) => (
                    <div key={meldIdx} className="tiles-row meld-tiles-row" style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '6px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9', marginBottom: '8px', position:'relative' }}>
                      {meld.length < 3 ? (
                        <div style={{display:'inline-block'}}>
                          {getSelectedTiles().map((tile, idx) => {
                            const allSelectedIndices = [
                              ...ponMelds.flat(),
                              ...chiMelds.flat(),
                              ...kanMelds.flat()
                            ];
                            const alreadySelected = meld.includes(idx);
                            const globallySelected = allSelectedIndices.includes(idx) && !alreadySelected;
                            const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                            return (
                              <div key={tile + '-chi-select-' + meldIdx + '-' + idx} className={`tile-counter ${(alreadySelected||globallySelected)?'winning-tile-selected':''}`}
                                style={{display:'inline-block',cursor:(alreadySelected||globallySelected)?'not-allowed':'pointer',opacity:(alreadySelected||globallySelected)?0.5:1}}
                                onClick={() => {
                                  if (!alreadySelected && !globallySelected && meld.length < 3) {
                                    setChiMelds(chiMelds.map((m,i)=>i===meldIdx?[...m,idx]:m));
                                  }
                                }}>
                                <img src={imagePath} alt={tile} className="tile-image" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        meld.map((idx, tileIdx) => {
                          const tile = getSelectedTiles()[idx];
                          const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                          return (
                            <div key={tile + '-chi-' + meldIdx + '-' + tileIdx} className="tile-counter">
                              <img src={imagePath} alt={tile} className="tile-image" />
                            </div>
                          );
                        })
                      )}
                      <button type="button" style={{position:'absolute',top:'4px',right:'4px',background:'#f44336',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',cursor:'pointer'}} onClick={() => setChiMelds(chiMelds.filter((_,i)=>i!==meldIdx))}>Delete</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setChiMelds([...chiMelds, []])} style={{margin:'4px'}}>+ Add Chi Meld</button>
                </div>
                <div className="meld-row">
                  <label>Kan Melds:</label>
                  <div style={{fontSize:'12px',color:'#888',marginBottom:'4px'}}>Indices: {JSON.stringify(kanMelds)}</div>
                  {kanMelds.map((meld, meldIdx) => (
                    <div key={meldIdx} className="tiles-row meld-tiles-row" style={{ overflowX: 'auto', whiteSpace: 'nowrap', padding: '6px', border: '1px solid #ccc', borderRadius: '8px', background: '#f9f9f9', marginBottom: '8px', position:'relative' }}>
                      {meld.length < 4 ? (
                        <div style={{display:'inline-block'}}>
                          {getSelectedTiles().map((tile, idx) => {
                            const allSelectedIndices = [
                              ...ponMelds.flat(),
                              ...chiMelds.flat(),
                              ...kanMelds.flat()
                            ];
                            const alreadySelected = meld.includes(idx);
                            const globallySelected = allSelectedIndices.includes(idx) && !alreadySelected;
                            const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                            return (
                              <div key={tile + '-kan-select-' + meldIdx + '-' + idx} className={`tile-counter ${(alreadySelected||globallySelected)?'winning-tile-selected':''}`}
                                style={{display:'inline-block',cursor:(alreadySelected||globallySelected)?'not-allowed':'pointer',opacity:(alreadySelected||globallySelected)?0.5:1}}
                                onClick={() => {
                                  if (!alreadySelected && !globallySelected && meld.length < 4) {
                                    setKanMelds(kanMelds.map((m,i)=>i===meldIdx?[...m,idx]:m));
                                  }
                                }}>
                                <img src={imagePath} alt={tile} className="tile-image" />
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        meld.map((idx, tileIdx) => {
                          const tile = getSelectedTiles()[idx];
                          const imagePath = `/Tile_PNGs/${tileImageMap[tile]}`;
                          return (
                            <div key={tile + '-kan-' + meldIdx + '-' + tileIdx} className="tile-counter">
                              <img src={imagePath} alt={tile} className="tile-image" />
                            </div>
                          );
                        })
                      )}
                      <button type="button" style={{position:'absolute',top:'4px',right:'4px',background:'#f44336',color:'#fff',border:'none',borderRadius:'4px',padding:'2px 8px',cursor:'pointer'}} onClick={() => setKanMelds(kanMelds.filter((_,i)=>i!==meldIdx))}>Delete</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setKanMelds([...kanMelds, []])} style={{margin:'4px'}}>+ Add Kan Meld</button>
                </div>
              </div>
            )}
          </div>
          <div className="additional-info">
            <label>
              <input
                type="checkbox"
                checked={isRiichi}
                onChange={(e) => setIsRiichi(e.target.checked)}
                data-tooltip-id="riichi-tip"
                data-tooltip-content="Declare ready hand, waiting for one tile to win."
              />
              <span data-tooltip-id="riichi-tip" data-tooltip-content="Declare ready hand, waiting for one tile to win.">Riichi</span>
              <Tooltip id="riichi-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isIppatsu}
                onChange={(e) => setIsIppatsu(e.target.checked)}
                data-tooltip-id="ippatsu-tip"
                data-tooltip-content="Win within one turn after declaring Riichi."
              />
              <span data-tooltip-id="ippatsu-tip" data-tooltip-content="Win within one turn after declaring Riichi.">Ippatsu</span>
              <Tooltip id="ippatsu-tip" place="top" />
            </label>
          </div>

          <label className="section-label">Advanced Options</label>
          <div className="additional-info">
            <label>
              <input
                type="checkbox"
                checked={isRinshan}
                onChange={(e) => setIsRinshan(e.target.checked)}
                data-tooltip-id="rinshan-tip"
                data-tooltip-content="Win by drawing a tile after a Kan (quad)."
              />
              <span data-tooltip-id="rinshan-tip" data-tooltip-content="Win by drawing a tile after a Kan (quad).">Rinshan</span>
              <Tooltip id="rinshan-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isChankan}
                onChange={(e) => setIsChankan(e.target.checked)}
                data-tooltip-id="chankan-tip"
                data-tooltip-content="Win by robbing a Kan (quad)."
              />
              <span data-tooltip-id="chankan-tip" data-tooltip-content="Win by robbing a Kan (quad).">Chankan</span>
              <Tooltip id="chankan-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isHaitei}
                onChange={(e) => setIsHaitei(e.target.checked)}
                data-tooltip-id="haitei-tip"
                data-tooltip-content="Win with the last tile drawn from the wall."
              />
              <span data-tooltip-id="haitei-tip" data-tooltip-content="Win with the last tile drawn from the wall.">Haitei</span>
              <Tooltip id="haitei-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isHoutei}
                onChange={(e) => setIsHoutei(e.target.checked)}
                data-tooltip-id="houtei-tip"
                data-tooltip-content="Win with the last discard."
              />
              <span data-tooltip-id="houtei-tip" data-tooltip-content="Win with the last discard.">Houtei</span>
              <Tooltip id="houtei-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isDaburuRiichi}
                onChange={(e) => setIsDaburuRiichi(e.target.checked)}
                data-tooltip-id="dabururiichi-tip"
                data-tooltip-content="Double Riichi: declare Riichi on your first turn."
              />
              <span data-tooltip-id="dabururiichi-tip" data-tooltip-content="Double Riichi: declare Riichi on your first turn.">Daburu Riichi</span>
              <Tooltip id="dabururiichi-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isNagashiMangan}
                onChange={(e) => setIsNagashiMangan(e.target.checked)}
                data-tooltip-id="nagashi-tip"
                data-tooltip-content="Win by only discarding terminals and honors."
              />
              <span data-tooltip-id="nagashi-tip" data-tooltip-content="Win by only discarding terminals and honors.">Nagashi Mangan</span>
              <Tooltip id="nagashi-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isTenhou}
                onChange={(e) => setIsTenhou(e.target.checked)}
                data-tooltip-id="tenhou-tip"
                data-tooltip-content="Dealer wins on the first turn."
              />
              <span data-tooltip-id="tenhou-tip" data-tooltip-content="Dealer wins on the first turn.">Tenhou</span>
              <Tooltip id="tenhou-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isRenhou}
                onChange={(e) => setIsRenhou(e.target.checked)}
                data-tooltip-id="renhou-tip"
                data-tooltip-content="Non-dealer wins on the first turn."
              />
              <span data-tooltip-id="renhou-tip" data-tooltip-content="Non-dealer wins on the first turn.">Renhou</span>
              <Tooltip id="renhou-tip" place="top" />
            </label>

            <label>
              <input
                type="checkbox"
                checked={isChiihou}
                onChange={(e) => setIsChiihou(e.target.checked)}
                data-tooltip-id="chiihou-tip"
                data-tooltip-content="Non-dealer self-draw win on the first turn."
              />
              <span data-tooltip-id="chiihou-tip" data-tooltip-content="Non-dealer self-draw win on the first turn.">Chiihou</span>
              <Tooltip id="chiihou-tip" place="top" />
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