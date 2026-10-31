import { createContext, useContext } from 'react'
import { useAudioPlayer } from '../hooks/useAudioPlayer.js'

const PlayerContext = createContext(null)

export function PlayerProvider({ children }) {
  return <PlayerContext.Provider value={useAudioPlayer()}>{children}</PlayerContext.Provider>
}

export const usePlayer = () => useContext(PlayerContext)
