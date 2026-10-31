// The song catalogue: ranked by measured YouTube views (see scripts/build_catalogue.py).
// The JSON is loaded lazily so it doesn't weigh down the first paint.

export const loadCatalogue = () => import('./catalogue.json').then((m) => m.default)

const youtube = (id) => `https://www.youtube.com/watch?v=${id}`

/** Catalogue entry → player track. `src` is null when no audio file is available to this site. */
export function toTrack(song, localFiles) {
  return {
    id: song.id,
    title: song.title,
    youtubeTitle: song.youtubeTitle,
    singer: song.singers.join(', '),
    views: song.views,
    compilation: song.compilation,
    youtube: youtube(song.id),
    src: localFiles.has(song.file) ? `/local-audio/${encodeURIComponent(song.file)}` : null,
  }
}

/** The featured song: the most-viewed single (not a long compilation). */
export const featuredOf = (list) => list.find((t) => !t.compilation && t.views) ?? list[0] ?? null
