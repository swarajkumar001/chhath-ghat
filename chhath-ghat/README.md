# छठ घाट — Chhath Ghat

A minimal, living Chhath Puja page: a painted riverside ghat at Sandhya or Usha Arghya, the most-loved Chhath songs, and a way to support the site.

## Run it

```powershell
cd chhath-ghat
npm install
npm run dev          # http://localhost:5173
```

`npm run build` writes a static site to `dist/`, ready for any static host (GitHub Pages, Netlify, Vercel…).

**Live site:** https://swarajkumar001.github.io/chhath-ghat/ — after changing anything (for example your donation details), publish again with:

```powershell
npm run deploy
```

## What's on the page

| Part | How it works |
| --- | --- |
| The ghat | A painting drawn in code (SVG + canvas), no photographs. The sun sits on the horizon; devotees stand waist-deep holding soops with a lit diya; a man pours arghya from a lota; a kosi of sugarcane, dauras, banana plants and rows of diyas line the steps. Everything moves gently: water glints and ripples, flames flicker, leaves sway, clouds and birds drift, embers rise. |
| Sandhya / Usha | Picked from the visitor's clock: early morning (3–11 am) shows the misty Usha Arghya dawn, otherwise the golden Sandhya evening. Add `?mode=usha` or `?mode=sandhya` to the URL to choose. |
| Float a diya | Touch the river anywhere to set a diya afloat, with a blessing. A one-time hint tells first-time visitors. |
| Music | One compact player in the middle. It always starts on the most popular Chhath song and previous/next move through the rest in order of popularity. There's no song list. Nothing autoplays. |
| सहयोग करें | A donation sheet with your UPI QR code, UPI ID, and small one-tap amounts (₹11, ₹21, ₹51, ₹101) that open the visitor's UPI app on a phone. |
| छठ पर्व | A short guide to the four days. |
| Language | हिन्दी / English. |

## Set up donations

Edit `src/data/donate.js`:

```js
export const DONATE = {
  upiId: 'yourname@okaxis',        // shown with a copy button, used for the UPI app button
  payee: 'Your Name',              // name the donor's UPI app shows
  qr: '/donate/upi-qr.png',        // put your QR image at public/donate/upi-qr.png
  amounts: [11, 21, 51, 101],      // suggested amounts in ₹
}
```

Until `upiId` or `qr` is filled in, the **सहयोग करें** buttons only appear during `npm run dev` (with placeholders), so the published site never shows an empty donation box.

## Songs: how "most popular" is decided

`src/data/catalogue.json` is built from YouTube's own view counts. No numbers are invented.

```powershell
..\venv\Scripts\python scripts\fetch_song_stats.py   # reads each video's stats (no download)
..\venv\Scripts\python scripts\build_catalogue.py    # ranks by views, cleans titles, writes the catalogue
```

The player queue is the single songs (not 20-minute jukeboxes) in order of views. The first song is the most-viewed: **उग हे सूरज देव — Anuradha Paudwal** (32.5 crore views when measured). Re-run both scripts to refresh.

## Music and copyright (important)

- During `npm run dev`, songs play from your own MP3s in `../Chhath_Puja_Songs` via a dev-only Vite plugin (`scripts/vite-plugin-local-songs.js`). These recordings are copyrighted and are **never** included in the build or the repository.
- On the published site, the player shows "इस गीत की ऑडियो यहाँ उपलब्ध नहीं है" with a **YouTube पर सुनें** link to the official upload. It never pretends to play.
- To play audio publicly, add only songs you have rights to (your own recordings, licensed or public-domain audio). Put them in `public/audio/` and list them in `src/data/tracks.js`.

## Structure

```
src/
  components/
    Hero.jsx  Player.jsx  TopBar.jsx  DonateSheet.jsx  AboutSheet.jsx  BlessingToast.jsx
    painting/   GhatPainting (layers + framing) · Sky · FarBank · River · Devotees · WaterDiyas
                Foreground (steps, kosi, dauras, banana plants, diyas) · Embers (canvas) · palette
    music/      controls (play, seek, volume, artwork)
  context/      SceneContext (mode, diyas, dialogs) · PlayerContext
  hooks/        useAudioPlayer (popularity queue, unavailable state) · usePersistentState
  data/         catalogue.json + catalogue.js · donate.js · tracks.js
  i18n/         strings (hi/en) · LanguageContext
scripts/        fetch_song_stats.py · build_catalogue.py · song_stats.json · vite-plugin-local-songs.js
```

The painting uses one 1600×900 coordinate space. Wide screens see the whole ghat; phones get a closer, bottom-anchored framing of the centre with the sky above for the title and player.
