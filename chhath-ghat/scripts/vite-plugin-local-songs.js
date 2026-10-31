import fs from 'node:fs'
import path from 'node:path'

/**
 * Dev-server only: serves the MP3s you downloaded yourself so the player can be
 * previewed locally. Nothing here is bundled into `npm run build`.
 *
 *   GET /local-audio/index.json   -> ["Song A.mp3", ...]
 *   GET /local-audio/<file>.mp3   -> audio, with HTTP Range support for seeking
 *
 * Folder: $CHHATH_SONGS_DIR, or ../Chhath_Puja_Songs next to this project.
 */
export default function localSongs() {
  return {
    name: 'local-songs',
    apply: 'serve',
    configureServer(server) {
      const dir = path.resolve(
        server.config.root,
        process.env.CHHATH_SONGS_DIR || '../Chhath_Puja_Songs',
      )
      const list = () =>
        fs.existsSync(dir)
          ? fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith('.mp3')).sort((a, b) => a.localeCompare(b))
          : []

      server.middlewares.use('/local-audio', (req, res) => {
        const url = decodeURIComponent((req.url || '/').split('?')[0])
        if (url === '/index.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          res.end(JSON.stringify(list()))
          return
        }

        const name = path.basename(url) // basename() blocks ../ path traversal
        const file = path.join(dir, name)
        if (!name.toLowerCase().endsWith('.mp3') || !fs.existsSync(file)) {
          res.statusCode = 404
          res.end()
          return
        }

        const { size } = fs.statSync(file)
        res.setHeader('Content-Type', 'audio/mpeg')
        res.setHeader('Accept-Ranges', 'bytes')
        const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '')
        if (!range) {
          res.setHeader('Content-Length', size)
          fs.createReadStream(file).pipe(res)
          return
        }
        const start = range[1] ? Number(range[1]) : 0
        const end = range[2] ? Math.min(Number(range[2]), size - 1) : size - 1
        if (start >= size) {
          res.statusCode = 416
          res.setHeader('Content-Range', `bytes */${size}`)
          res.end()
          return
        }
        res.statusCode = 206
        res.setHeader('Content-Range', `bytes ${start}-${end}/${size}`)
        res.setHeader('Content-Length', end - start + 1)
        fs.createReadStream(file, { start, end }).pipe(res)
      })
    },
  }
}
