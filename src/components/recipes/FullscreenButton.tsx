import { useFullscreen } from '../../hooks/useFullscreen'
import { IconButton } from '../ui/IconButton'
import MaximizeIcon from '../../assets/icons/maximize.svg?react'
import MinimizeIcon from '../../assets/icons/minimize.svg?react'

/** Tablet only (see .tablet-only): a phone is too small to prop up, a desktop has no use for it */
export function FullscreenButton() {
  const { supported, active, toggle } = useFullscreen()
  if (!supported) return null

  return (
    <span className="tablet-only">
      <IconButton
        label={active ? 'Exit full screen' : 'Full screen'}
        variant="secondary"
        aria-pressed={active}
        onClick={toggle}
      >
        {active ? <MinimizeIcon /> : <MaximizeIcon />}
      </IconButton>
    </span>
  )
}
