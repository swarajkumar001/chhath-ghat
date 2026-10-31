import { createContext, useContext, useEffect, useMemo } from 'react'
import { usePersistentState } from '../hooks/usePersistentState.js'
import { STRINGS } from './strings.js'

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = usePersistentState('ghat.lang', 'hi')

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const value = useMemo(
    () => ({ lang, t: STRINGS[lang] ?? STRINGS.hi, toggleLang: () => setLang((l) => (l === 'hi' ? 'en' : 'hi')) }),
    [lang, setLang],
  )
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => useContext(LanguageContext)
