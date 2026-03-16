import { useState, useEffect } from 'react'

function App() {
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/')
      .then(res => res.json())
      .then(data => setMessage(data))
  }, [])

  return (<div className="App">
      <h1 className="text-3xl font-bold underline">
        {message}
      </h1>
    </div>
  )
}

export default App