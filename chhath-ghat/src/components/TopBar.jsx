import { useScene } from '../context/SceneContext.jsx'
import { donateReady } from '../data/donate.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

/** Three small pills at the top: about the festival, support, and the language switch. */
export default function TopBar() {
  const { t, toggleLang } = useLanguage()
  const { setAboutOpen, setDonateOpen } = useScene()
  const pill = 'control-surface rounded-full px-3.5 py-1.5 text-xs text-amber-50/90 transition hover:text-white sm:text-sm'

  return (
    <header className="fixed inset-x-0 top-0 z-40 flex justify-center px-3 pt-3">
      <a href="#ghat" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-black">
        {t.skip}
      </a>
      <nav className="flex items-center gap-2" aria-label={t.brand}>
        <button type="button" onClick={() => setAboutOpen(true)} className={pill}>
          {t.nav.about}
        </button>
        {(donateReady || import.meta.env.DEV) && (
          <button type="button" onClick={() => setDonateOpen(true)} className={pill}>
            {t.nav.donate}
          </button>
        )}
        <button type="button" onClick={toggleLang} className={pill} lang={t.langToggle === 'English' ? 'en' : 'hi'}>
          {t.langToggle}
        </button>
      </nav>
    </header>
  )
}
