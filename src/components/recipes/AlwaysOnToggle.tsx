import { useWakeLock } from '../../hooks/useWakeLock'

export function AlwaysOnToggle() {
  const { supported, enabled, setEnabled } = useWakeLock()
  if (!supported) return null

  return (
    <label className="toggle-field" title="Keep the screen awake while you cook">
      <span className="toggle">
        <input type="checkbox" role="switch" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        <span className="track" />
        <span className="thumb" />
      </span>
      Always on
    </label>
  )
}
