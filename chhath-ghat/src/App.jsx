import AboutSheet from './components/AboutSheet.jsx'
import BlessingToast from './components/BlessingToast.jsx'
import DonateSheet from './components/DonateSheet.jsx'
import Hero from './components/Hero.jsx'
import TopBar from './components/TopBar.jsx'
import { PlayerProvider } from './context/PlayerContext.jsx'
import { SceneProvider } from './context/SceneContext.jsx'
import { LanguageProvider } from './i18n/LanguageContext.jsx'

export default function App() {
  return (
    <LanguageProvider>
      <SceneProvider>
        <PlayerProvider>
          <TopBar />
          <main>
            <Hero />
          </main>
          <BlessingToast />
          <AboutSheet />
          <DonateSheet />
        </PlayerProvider>
      </SceneProvider>
    </LanguageProvider>
  )
}
