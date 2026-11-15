import { useEffect, useRef, type ReactNode } from 'react'
import { defaults, options, type Preferences } from './preferences'
import './settings.css'

const labels = {
  light: '浅色', dark: '深色', system: '跟随系统',
  multicolor: '默认', sand: '暖砂', sage: '鼠尾草绿', slate: '雾蓝',
  default: '默认', serif: '衬线',
  jetbrains: 'JetBrains Mono', consolas: 'Consolas', courier: 'Courier New',
}

function LayoutPreview() {
  return <svg className="settings-layout" viewBox="0 0 108 64" aria-hidden="true">
    <use href={`${import.meta.env.BASE_URL}pictures/previews/learning-layout.svg#learning-layout`} />
  </svg>
}

const choicesByName: { [Key in keyof Preferences]: readonly Preferences[Key][] } = options

function Choices<Key extends keyof Preferences>({ name, title, value, onChange, preview }: {
  name: Key
  title: string
  value: Preferences[Key]
  onChange: (value: Preferences[Key]) => void
  preview: (value: Preferences[Key]) => ReactNode
}) {
  const choices = choicesByName[name]
  return <fieldset className="settings-group">
    <legend>{title}</legend>
    <div className={name === 'palette' ? 'settings-choices settings-palette-choices' : 'settings-choices'}>
      {choices.map((choice) => <label key={choice} className="settings-option">
        <input type="radio" name={name} value={choice} checked={choice === value} onChange={() => onChange(choice)} />
        <span className="settings-option-tile">
          {preview(choice)}
          <span className="settings-option-label">{name === 'font' && choice === 'system' ? '系统字体' : labels[choice]}</span>
        </span>
      </label>)}
    </div>
  </fieldset>
}

export default function SettingsPage({ preferences, onChange, onBack }: {
  preferences: Preferences
  onChange: (preferences: Preferences) => void
  onBack: () => void
}) {
  const title = useRef<HTMLHeadingElement>(null)
  useEffect(() => { title.current?.focus() }, [])

  return <main className="settings-page" aria-labelledby="settings-title">
    <header className="page-header settings-header">
      <div>
        <h1 id="settings-title" ref={title} tabIndex={-1}>设置</h1>
        <p className="page-description">调整学习界面的主题、配色和字体，选择后即时生效。</p>
      </div>
      <button type="button" className="settings-action" onClick={onBack}>返回学习</button>
    </header>

    <div className="settings-groups">
      <Choices name="theme" title="主题" value={preferences.theme} onChange={(theme) => onChange({ ...preferences, theme })}
        preview={(theme) => <span className="settings-preview settings-theme-preview" data-theme-preview={theme}>
          {theme === 'system' ? <><span data-theme-preview="light"><LayoutPreview /></span><span data-theme-preview="dark"><LayoutPreview /></span></> : <LayoutPreview />}
        </span>} />
      <Choices name="palette" title="配色" value={preferences.palette} onChange={(palette) => onChange({ ...preferences, palette })}
        preview={(palette) => <span className="settings-preview settings-palette-preview" data-palette={palette}><LayoutPreview /></span>} />
      <Choices name="font" title="界面字体" value={preferences.font} onChange={(font) => onChange({ ...preferences, font })}
        preview={(font) => <span className="settings-preview settings-font-preview" data-interface-font={font} aria-hidden="true">Aa 学习</span>} />
      <Choices name="codeFont" title="教学代码字体" value={preferences.codeFont} onChange={(codeFont) => onChange({ ...preferences, codeFont })}
        preview={(codeFont) => <code className="settings-preview settings-code-preview" data-code-font={codeFont} aria-hidden="true">Node* next;</code>} />
    </div>

    <button type="button" className="settings-action" onClick={() => onChange(defaults)}>恢复默认设置</button>
  </main>
}
