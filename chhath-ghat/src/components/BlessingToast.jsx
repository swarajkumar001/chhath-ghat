import { AnimatePresence, motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { useEffect } from 'react'
import { useScene } from '../context/SceneContext.jsx'
import { useLanguage } from '../i18n/LanguageContext.jsx'

/** A blessing after a diya is floated, or the one-time hint that the river can be touched. */
export default function BlessingToast() {
  const { toast, clearToast } = useScene()
  const { t } = useLanguage()

  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(clearToast, 4200)
    return () => clearTimeout(id)
  }, [toast, clearToast])

  const text = toast && (toast.key === 'blessing' ? t.blessings[toast.index] : t.diya.hintWater)

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4" role="status" aria-live="polite">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.p
            key={toast.id}
            initial={{ opacity: 0, y: -10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="player-card flex max-w-md items-center gap-2 rounded-2xl px-4 py-3 text-sm text-amber-50 shadow-xl sm:text-base"
          >
            <Flame className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            <span className="font-display">{text}</span>
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
