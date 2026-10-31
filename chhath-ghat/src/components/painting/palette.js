// Colours of the painted ghat. Sandhya = the evening offering, Usha = the morning one.
// The page picks one from the visitor's local time (?mode=sandhya|usha overrides it).

export const PALETTES = {
  sandhya: {
    sky: ['#1d1236', '#47204f', '#8f2f4a', '#d6553a', '#f39340', '#ffcf7a'],
    skyStops: [0, 0.22, 0.42, 0.62, 0.8, 1],
    sun: '#fff3c4',
    sunEdge: '#ffb44d',
    glow: '#ffae4f',
    cloudTop: '#5a2649',
    cloudLit: '#ff9a52',
    farTrees: '#3b1a2c',
    nearTrees: '#24101b',
    haze: '#f2945a',
    windows: 0.9,
    water: ['#f3a24f', '#c25a3f', '#5d2238', '#1d0f20'],
    glint: '#fff0c0',
    ripple: '#ffc27a',
    figure: '#1b0b10',
    rim: '#ffab55',
    stone: ['#6e3b2c', '#3d1e18', '#24110d'],
    leaf: '#1d2a14',
    leafRim: '#c97a3a',
    mist: 0,
  },
  usha: {
    sky: ['#26365f', '#4f5c93', '#9a7fae', '#e39aa4', '#f7bd94', '#ffe2b4'],
    skyStops: [0, 0.2, 0.4, 0.6, 0.8, 1],
    sun: '#fff6dc',
    sunEdge: '#ffc58a',
    glow: '#ffc79a',
    cloudTop: '#5b5f8f',
    cloudLit: '#ffbf9e',
    farTrees: '#4c4a6a',
    nearTrees: '#2a2638',
    haze: '#f6c6b4',
    windows: 0.25,
    water: ['#f8cdb0', '#c99aa6', '#5f5a7c', '#252238'],
    glint: '#fff8e6',
    ripple: '#ffe1c4',
    figure: '#241a26',
    rim: '#ffcfa0',
    stone: ['#6c5458', '#3e3038', '#241c24'],
    leaf: '#1f2c22',
    leafRim: '#e7b08c',
    mist: 0.55,
  },
}

/** Early morning → Usha; afternoon and night → Sandhya. */
export function modeForNow(date = new Date()) {
  const h = date.getHours()
  return h >= 3 && h < 11 ? 'usha' : 'sandhya'
}

/** Small deterministic random generator, so the painting is the same on every visit. */
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const HORIZON = 560
export const WATER_EDGE = 778 // where the river meets the first ghat step
export const SUN = { x: 800, y: 528 }
