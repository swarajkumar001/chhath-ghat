import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useScene } from '../context/SceneContext.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

/** Short introduction to Chhath and its four days. The full timeline section comes in Phase 5. */
export default function AboutSheet() {
  const { aboutOpen, setAboutOpen } = useScene()
  const { t } = useLanguage()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!aboutOpen) return undefined
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setAboutOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [aboutOpen, setAboutOpen])

  return (
    <AnimatePresence>
      {aboutOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setAboutOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="about-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="drawer-surface scrollbar-thin max-h-[85svh] w-full max-w-2xl overflow-y-auto rounded-3xl p-6 text-amber-50 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <h2 id="about-title" className="font-display text-3xl text-gold">{t.about.title}</h2>
              <button
                ref={closeRef}
                type="button"
                onClick={() => setAboutOpen(false)}
                aria-label={t.about.close}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-white/10"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 leading-relaxed text-amber-50/90">{t.about.intro}</p>
            <ol className="mt-6 grid gap-3 sm:grid-cols-2">
              {t.about.days.map(([name, text], i) => (
                <li key={name} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <p className="text-xs tracking-widest text-saffron">{String(i + 1).padStart(2, '0')}</p>
                  <h3 className="font-display text-xl text-amber-50">{name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-amber-50/80">{text}</p>
                </li>
              ))}
            </ol>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
