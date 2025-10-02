import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Map from './pages/map'

function App() {
    return (
      <BrowserRouter>
        <div>

            <Routes>
            <Route path="/" element={<Map />} />

          </Routes>
          </div>
      </BrowserRouter>
    )
  }
  
  export default App