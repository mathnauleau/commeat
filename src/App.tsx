import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Shelf } from './pages/Shelf'
import { Recipe } from './pages/Recipe'
import { Settings } from './pages/Settings'
import { SyncToast } from './components/layout/SyncToast'
import { useGitHub } from './hooks/useGitHub'

const ENV_TOKEN = import.meta.env.VITE_GITHUB_TOKEN as string | undefined

function AppRoutes() {
  const { isConnected, connect } = useGitHub()

  // Auto-connect from env var if not already connected (dev convenience)
  useEffect(() => {
    if (!isConnected && ENV_TOKEN) {
      connect(ENV_TOKEN).catch(console.error)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <SyncToast />
      <Routes>
        <Route path="/" element={<Shelf />} />
        <Route path="/recipe/:slug" element={<Recipe />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}
