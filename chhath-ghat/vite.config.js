import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import localSongs from './scripts/vite-plugin-local-songs.js'

// BASE_PATH is set by the GitHub Pages workflow (the site lives under /chhath-ghat/ there).
export default defineConfig(({ command }) => ({
  base: command === 'build' ? process.env.BASE_PATH || '/' : '/',
  plugins: [react(), localSongs()],
}))
