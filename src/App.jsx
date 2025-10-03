import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Map from './pages/map'
import Test from './pages/test'
import './index.css'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
    return (
      <BrowserRouter>
        <div>
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
            <Routes>
            <Route path="/" element={<Map />} />
            <Route path="/test" element={<Test />} />

          </Routes>
          </div>
      </BrowserRouter>
    )
  }
  
  export default App