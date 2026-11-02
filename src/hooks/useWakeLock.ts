import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'commeat-always-on'

function isSupported(): boolean {
  return typeof navigator !== 'undefined' && 'wakeLock' in navigator
}

/**
 * Keeps the screen awake while enabled. The browser drops the lock whenever the
 * page is hidden, so it is taken again each time the cook comes back to the tab.
 * The choice is remembered, so the next recipe opens the way the last one was left.
 */
export function useWakeLock() {
  const supported = isSupported()
  const [enabled, setEnabledState] = useState(() => supported && localStorage.getItem(STORAGE_KEY) === 'on')

  const setEnabled = useCallback((next: boolean) => {
    localStorage.setItem(STORAGE_KEY, next ? 'on' : 'off')
    setEnabledState(next)
  }, [])

  useEffect(() => {
    if (!enabled) return
    let lock: WakeLockSentinel | null = null
    let requesting = false
    let cancelled = false

    async function acquire() {
      if (document.visibilityState !== 'visible' || requesting || (lock && !lock.released)) return
      requesting = true
      try {
        const sentinel = await navigator.wakeLock.request('screen')
        if (cancelled) sentinel.release()
        else lock = sentinel
      } catch {
        // Refused (battery saver, no user gesture yet): show it off, keep the saved choice
        if (!cancelled) setEnabledState(false)
      } finally {
        requesting = false
      }
    }

    acquire()
    document.addEventListener('visibilitychange', acquire)
    return () => {
      cancelled = true
      document.removeEventListener('visibilitychange', acquire)
      lock?.release()
    }
  }, [enabled])

  return { supported, enabled, setEnabled }
}
