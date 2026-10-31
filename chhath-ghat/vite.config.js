import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import localSongs from './scripts/vite-plugin-local-songs.js'

export default defineConfig({
  plugins: [react(), localSongs()],
})
