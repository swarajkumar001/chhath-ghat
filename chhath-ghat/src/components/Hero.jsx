import { motion } from 'framer-motion'
import { HandHeart } from 'lucide-react'
import { useScene } from '../context/SceneContext.jsx'
import { donateReady } from '../data/donate.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'
import Player from './Player.jsx'
import GhatPainting from './painting/GhatPainting.jsx'

const rise = (delay) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.2, 0.7, 0.2, 1] },
})

/** The painted ghat, with just the title, the music and a way to support — in the middle of the sky. */
export default function Hero() {
  const { setDonateOpen } = useScene()
  const { t } = useLanguage()

  return (
    <section id="ghat" aria-label={t.brand} className="relative h-[100svh] min-h-[620px] w-full overflow-hidden">
      <GhatPainting />
      <div className="pointer-events-none relative z-10 mx-auto flex max-w-xl flex-col items-center px-4 pt-[11svh] text-center sm:pt-[9svh]">
        <motion.h1 {...rise(0.1)} className="hero-title font-display text-[clamp(3rem,9vw,5.75rem)] leading-[1.15]">
          ॥ छठ पूजा ॥
        </motion.h1>
        <motion.p {...rise(0.3)} className="hero-copy-shadow font-display text-base text-amber-50/90 sm:text-xl">
          {t.subtitle}
        </motion.p>
        <motion.div {...rise(0.5)} className="pointer-events-auto mt-6 flex w-full justify-center">
          <Player />
        </motion.div>
        {(donateReady || import.meta.env.DEV) && (
          <motion.button
            {...rise(0.7)}
            type="button"
            onClick={() => setDonateOpen(true)}
            className="control-surface pointer-events-auto mt-3 flex items-center gap-2 rounded-full px-4 py-2 text-sm text-amber-50 transition hover:text-white"
          >
            <HandHeart className="h-4 w-4 text-gold" aria-hidden="true" />
            {t.nav.donate}
          </motion.button>
        )}
      </div>
    </section>
  )
}
