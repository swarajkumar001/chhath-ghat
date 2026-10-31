import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { modeForNow } from '../components/painting/palette.js'
import { usePersistentState } from '../hooks/usePersistentState.js'
import { STRINGS } from '../i18n/strings.js'

const SceneContext = createContext(null)

const MAX_DIYAS = 40

/** Evening or morning light: from the visitor's clock, or ?mode=sandhya|usha. */
function initialMode() {
  const m = new URLSearchParams(window.location.search).get('mode')
  return m === 'sandhya' || m === 'usha' ? m : modeForNow()
}

let nextId = 1
function makeDiya(x, y, fresh = true) {
  const r = Math.random
  return { id: nextId++, x, y, fresh, drift: (r() < 0.5 ? -1 : 1) * (120 + r() * 220), duration: 50 + r() * 40, bob: -r() * 4 }
}

export function SceneProvider({ children }) {
  const [mode] = useState(initialMode)
  const [diyas, setDiyas] = useState([])
  const [toast, setToast] = useState(null)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [donateOpen, setDonateOpen] = useState(false)
  const [hinted, setHinted] = usePersistentState('ghat.hinted', false)

  const showToast = useCallback((key, index) => setToast({ key, index, id: Date.now() }), [])

  // A one-time, quiet hint that the river can be touched.
  useEffect(() => {
    if (hinted) return undefined
    const id = setTimeout(() => {
      showToast('hint')
      setHinted(true)
    }, 7000)
    return () => clearTimeout(id)
  }, [hinted, setHinted, showToast])

  /** Tapping the river sets a diya afloat there and offers a blessing. */
  const floatDiyaAt = useCallback(
    (x, y) => {
      setDiyas((list) => [...list.slice(-(MAX_DIYAS - 1)), makeDiya(x, y)])
      showToast('blessing', Math.floor(Math.random() * STRINGS.hi.blessings.length))
    },
    [showToast],
  )
  const removeDiya = useCallback((id) => setDiyas((list) => list.filter((d) => d.id !== id)), [])

  const value = useMemo(
    () => ({
      mode,
      diyas,
      floatDiyaAt,
      removeDiya,
      toast,
      clearToast: () => setToast(null),
      aboutOpen,
      setAboutOpen,
      donateOpen,
      setDonateOpen,
    }),
    [mode, diyas, floatDiyaAt, removeDiya, toast, aboutOpen, donateOpen],
  )
  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>
}

export const useScene = () => useContext(SceneContext)
