import { AnimatePresence, motion } from 'framer-motion'
import { Check, Copy, QrCode, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useScene } from '../context/SceneContext.jsx'
import { DONATE, upiLink } from '../data/donate.js'
import { useLanguage } from '../i18n/LanguageContext.jsx'

/** UPI donation: QR code, UPI ID, and small one-tap amounts that open the visitor's UPI app. */
export default function DonateSheet() {
  const { donateOpen, setDonateOpen } = useScene()
  const { t } = useLanguage()
  const [amount, setAmount] = useState(DONATE.amounts[1])
  const [copied, setCopied] = useState(false)
  const closeRef = useRef(null)

  useEffect(() => {
    if (!donateOpen) return undefined
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && setDonateOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [donateOpen, setDonateOpen])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(DONATE.upiId)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked: the ID is still visible to copy by hand */
    }
  }

  return (
    <AnimatePresence>
      {donateOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 p-3 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setDonateOpen(false)}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="donate-title"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="drawer-surface scrollbar-thin max-h-[92svh] w-full max-w-sm overflow-y-auto rounded-3xl p-5 text-center text-amber-50"
          >
            <div className="flex justify-end">
              <button ref={closeRef} type="button" onClick={() => setDonateOpen(false)} aria-label={t.donate.close} className="-m-2 grid h-10 w-10 place-items-center rounded-full hover:bg-white/10">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <h2 id="donate-title" className="font-display text-2xl text-amber-50">{t.donate.title}</h2>
            <p className="mx-auto mt-1.5 max-w-xs text-sm leading-relaxed text-amber-100/75">{t.donate.intro}</p>

            <div className="mx-auto mt-5 grid h-52 w-52 place-items-center overflow-hidden rounded-2xl bg-white p-3">
              {DONATE.qr ? (
                <img src={DONATE.qr} alt={`UPI QR — ${DONATE.upiId || t.donate.title}`} className="h-full w-full object-contain" />
              ) : (
                <div className="grid h-full w-full place-items-center rounded-xl border-2 border-dashed border-stone-300 p-4 text-stone-500">
                  <QrCode className="h-12 w-12" aria-hidden="true" />
                  <span className="text-xs leading-snug">{t.donate.qrMissing}</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-amber-100/60">{t.donate.scan}</p>

            {DONATE.upiId && (
              <button type="button" onClick={copy} className="mx-auto mt-3 flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm hover:bg-white/[0.12]">
                <span className="text-amber-100/60">{t.donate.upi}:</span>
                <span className="font-medium">{DONATE.upiId}</span>
                {copied ? <Check className="h-4 w-4 text-green-300" aria-label={t.donate.copied} /> : <Copy className="h-4 w-4" aria-label={t.donate.copy} />}
              </button>
            )}

            <fieldset className="mt-5">
              <legend className="mx-auto text-xs text-amber-100/60">{t.donate.amount}</legend>
              <div className="mt-2 flex justify-center gap-2">
                {DONATE.amounts.map((a) => (
                  <button
                    key={a}
                    type="button"
                    aria-pressed={amount === a}
                    onClick={() => setAmount(a)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${amount === a ? 'bg-amber-50 text-[#2b1206]' : 'bg-white/[0.07] text-amber-50 hover:bg-white/[0.12]'}`}
                  >
                    ₹{a}
                  </button>
                ))}
              </div>
            </fieldset>

            {DONATE.upiId && (
              <>
                <a href={upiLink(amount)} className="btn-primary mt-4 block rounded-full px-5 py-3 text-sm font-semibold">
                  {t.donate.pay(amount)}
                </a>
                <p className="mt-1.5 text-[11px] text-amber-100/50">{t.donate.phoneOnly}</p>
              </>
            )}

            {import.meta.env.DEV && !DONATE.upiId && !DONATE.qr && (
              <p className="mt-4 rounded-xl border border-dashed border-amber-200/30 p-2 text-[11px] text-amber-100/70">{t.donate.setupNote}</p>
            )}
            <p className="mt-4 font-display text-sm text-gold">{t.donate.thanks}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
