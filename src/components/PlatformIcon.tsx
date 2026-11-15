import type { CSSProperties } from 'react'
import './PlatformIcon.css'

const iconBase = `${import.meta.env.BASE_URL}pictures/`

export default function PlatformIcon({ name, colored = false }: { name: string; colored?: boolean }) {
  const style = {
    '--icon-black': `url(${iconBase}black/${name}-black.svg)`,
    '--icon-white': `url(${iconBase}white/${name}-white.svg)`,
    ...(colored && { '--icon-color': `url(${iconBase}color/${name}-color.svg)` }),
  } as CSSProperties

  return <i className="platform-icon" data-icon-colored={colored || undefined} style={style} aria-hidden="true" />
}
