# Chhath Puja

Two parts:

- **[chhath-ghat/](chhath-ghat/)** — the Chhath Ghat website: a painted, living ghat at Sandhya / Usha Arghya, the most popular Chhath songs, and UPI donations. See its README to run it and to set up your QR code.
- **chhath_downloader.py** — a personal tool that downloads Chhath songs from YouTube as MP3 (instructions below). Downloaded songs stay on your computer; they are not part of this repository.

---

## Chhath Puja Song Downloader

Downloads Chhath Puja songs from YouTube (single videos or whole playlists) as
**320 kbps MP3s** with title/artist tags and the video thumbnail as cover art.
Files are saved to a `Chhath_Puja_Songs/` folder.

---

## 1. Windows (PowerShell)

Open PowerShell in the folder that contains `chhath_downloader.py`.

1. **Check Python** (3.9 or newer is needed):
   ```powershell
   python --version
   ```
   If it isn't found, install it with `winget install --id Python.Python.3.12 -e`
   (or from python.org, ticking **"Add python.exe to PATH"**).

2. **Create and activate a virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```
   Your prompt now starts with `(venv)`. If you get a red "running scripts is
   disabled" error, see [Troubleshooting](#troubleshooting).

3. **Install yt-dlp:**
   ```powershell
   pip install -U yt-dlp
   ```
   (or `pip install -U -r requirements.txt`, which also pulls in yt-dlp's
   recommended extras)

4. **Install FFmpeg** (does the MP3 conversion and cover-art embedding):
   ```powershell
   winget install --id Gyan.FFmpeg -e
   ```
   Recommended: also install Deno. Current yt-dlp needs a JavaScript runtime
   to get every YouTube format. Without it, each run warns
   "No supported JavaScript runtime could be found":
   ```powershell
   winget install --id DenoLand.Deno -e
   ```

5. **Close and reopen PowerShell** so FFmpeg is on your PATH, then go back to the
   folder, re-activate the venv and check:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ffmpeg -version
   ```

6. **Run it:**
   ```powershell
   # One song
   python chhath_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID"

   # A whole playlist
   python chhath_downloader.py "https://www.youtube.com/playlist?list=PLAYLIST_ID"

   # Several URLs at once
   python chhath_downloader.py "URL1" "URL2"

   # A video link that is inside a playlist (&list=...): get the whole playlist
   python chhath_downloader.py "https://www.youtube.com/watch?v=VIDEO_ID&list=PLAYLIST_ID" --playlist

   # Save somewhere else (creates D:\Music\Chhath_Puja_Songs)
   python chhath_downloader.py "URL" --output "D:\Music"

   # No arguments: you'll be asked to paste a URL
   python chhath_downloader.py
   ```

Always put URLs in quotes. In PowerShell an unquoted `&` breaks the command.

---

## 2. macOS

```bash
python3 --version
python3 -m venv venv
source venv/bin/activate
pip install -U yt-dlp
brew install ffmpeg deno   # needs Homebrew: https://brew.sh
# open a new terminal tab, re-activate the venv, then:
ffmpeg -version
python chhath_downloader.py "https://www.youtube.com/playlist?list=PLAYLIST_ID"
python chhath_downloader.py "URL" --output ~/Music
```

## 3. Linux (Debian/Ubuntu)

```bash
python3 --version
sudo apt install python3-venv ffmpeg
python3 -m venv venv
source venv/bin/activate
pip install -U yt-dlp
curl -fsSL https://deno.land/install.sh | sh   # recommended JS runtime for yt-dlp
ffmpeg -version
python chhath_downloader.py "https://www.youtube.com/playlist?list=PLAYLIST_ID"
python chhath_downloader.py "URL" --output ~/Music
```

---

## What it does

- Saves `<Clean Title>.mp3` into `Chhath_Puja_Songs/` (next to the script, or
  under `--output`).
- Removes clutter like `(Official Video)`, `[Full Song]`, `| Lyrical` and
  `#hashtags`. Edit `CLUTTER_PATTERNS` at the top of the script to change this.
- Skips songs it already downloaded. It keeps a list in
  `Chhath_Puja_Songs/downloaded.txt`, and it never overwrites an existing MP3
  with the same name. Running the same playlist again only fetches new songs.
- Private, deleted or blocked videos are reported and skipped. The rest of
  the playlist carries on.
- Prints a summary at the end: downloaded, skipped and failed counts. The exit
  code is `1` if anything failed.

To download a song again, delete its MP3 **and** its line in `downloaded.txt`.

---

## Troubleshooting

**`ERROR: FFmpeg was not found on your PATH`**
Install FFmpeg (step 4), then **close and reopen the terminal**. Already-open
windows don't see PATH changes. Check with `ffmpeg -version`. On Windows, if it
still isn't found, sign out and back in.

**`HTTP Error 403: Forbidden`, `Sign in to confirm you're not a bot`, or
"Requested format is not available"**
YouTube changes often, and old yt-dlp versions stop working. Update it:
```powershell
pip install -U yt-dlp
```
then run again. If the warnings mention a missing *JavaScript runtime*, install
Deno (`winget install --id DenoLand.Deno -e`, `brew install deno`, or see
deno.com) and restart the terminal. If "Sign in to confirm" keeps showing up,
wait a while or try another network. YouTube rate-limits IP addresses that
download a lot.

**`Activate.ps1 cannot be loaded because running scripts is disabled on this system`**
Allow local scripts for your user (one-time), then activate again:
```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
.\venv\Scripts\Activate.ps1
```
Or allow them for the current window only:
`Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`.
