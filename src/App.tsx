import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shelf } from './pages/Shelf'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shelf />} />
      </Routes>
    </BrowserRouter>
  )
}
