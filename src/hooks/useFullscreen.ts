import { useCallback, useEffect, useState } from 'react'

function isSupported(): boolean {
  return typeof document !== 'undefined' && document.fullscreenEnabled === true
}

/**
 * Tracks and toggles browser fullscreen. Follows the document rather than local state,
 * so leaving with Escape or the system gesture flips the button back too.
 */
export function useFullscreen() {
  const supported = isSupported()
  const [active, setActive] = useState(() => supported && document.fullscreenElement !== null)

  useEffect(() => {
    if (!supported) return
    const sync = () => setActive(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', sync)
    return () => document.removeEventListener('fullscreenchange', sync)
  }, [supported])

  // Leaving the recipe page leaves fullscreen with it
  useEffect(() => () => {
    if (supported && document.fullscreenElement) document.exitFullscreen().catch(() => {})
  }, [supported])

  const toggle = useCallback(() => {
    const request = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen()
    request.catch(() => {})
  }, [])

  return { supported, active, toggle }
}
