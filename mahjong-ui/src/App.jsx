import { useState, useEffect } from 'react'
import client from './api/client'
import PlayerNamesForm from './components/PlayerNamesForm'
import HandSubmissionForm2 from './components/HandSubmissionForm2'
import './styles/App.css'

function App() {
  const [playerNames, setPlayerNames] = useState(['', '', '', ''])
  const [submitted, setSubmitted] = useState(false)

  const handleNamesSubmit = (names) => {
    setPlayerNames(names)
    setSubmitted(true)
  }

  const handleHandSubmitted = async () => {
    // Refresh only the hand submission form
  }
  
  return (
    <div className="App">
      {!submitted ? (
        <PlayerNamesForm onSubmit={handleNamesSubmit} />
      ) : (
        <HandSubmissionForm2
          playerNames={playerNames}
          onHandSubmitted={handleHandSubmitted}
        />
      )}
    </div>
  )
}

export default App