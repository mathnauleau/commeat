import { useThemeStore } from '../../store/theme'
import type { ThemeName } from '../../types'

const THEMES: { name: ThemeName; label: string; hint: string }[] = [
  { name: 'botanical', label: 'Botanical', hint: 'Daylight' },
  { name: 'dusk', label: 'Dusk', hint: 'Lights low' },
]

export function ThemePicker() {
  const { theme, setTheme } = useThemeStore()

  return (
    <div className="flex flex-col gap-3">
      <span className="label" id="theme-label">Theme</span>
      <div className="flex flex-wrap gap-2" role="group" aria-labelledby="theme-label">
        {THEMES.map(({ name, label, hint }) => {
          const active = theme === name
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              className={`btn btn-sm ${active ? 'btn-primary' : 'btn-secondary'}`}
              style={{ borderRadius: 'var(--r-md)', gap: '6px' }}
              onClick={() => setTheme(name)}
            >
              {label}
              <span className="t-caption" style={{ color: 'inherit', opacity: 0.75 }}>{hint}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
