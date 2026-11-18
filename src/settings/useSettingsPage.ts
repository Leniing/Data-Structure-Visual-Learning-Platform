import { useEffect, useState } from 'react'

const settingsHash = '#settings'
const isSettingsPage = () => window.location.hash === settingsHash

export function useSettingsPage() {
  const [settingsOpen, setSettingsOpen] = useState(isSettingsPage)

  useEffect(() => {
    const syncPage = () => setSettingsOpen(isSettingsPage())
    window.addEventListener('popstate', syncPage)
    window.addEventListener('hashchange', syncPage)
    return () => {
      window.removeEventListener('popstate', syncPage)
      window.removeEventListener('hashchange', syncPage)
    }
  }, [])

  function openSettings() {
    if (isSettingsPage()) return
    window.history.pushState({ fromLearning: true }, '', settingsHash)
    setSettingsOpen(true)
  }

  function returnToLearning() {
    if (window.history.state?.fromLearning) {
      window.history.back()
    } else {
      const { pathname, search } = window.location
      window.history.replaceState(null, '', pathname + search)
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    }
  }

  return { settingsOpen, openSettings, returnToLearning }
}
