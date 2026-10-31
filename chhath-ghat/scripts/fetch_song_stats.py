"""Fetch real YouTube statistics for every downloaded song (no audio is downloaded).

Reads the IDs from ../Chhath_Puja_Songs/downloaded.txt and writes scripts/song_stats.json with
view/like counts, channel, upload date and the metadata YouTube itself attaches (track/artist).
The numbers are a snapshot taken on `fetched_at`; re-run this script to refresh them.

    ..\\venv\\Scripts\\python scripts\\fetch_song_stats.py
"""
from __future__ import annotations

import json
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from pathlib import Path

import yt_dlp

ROOT = Path(__file__).resolve().parent
SONGS = ROOT.parent.parent / "Chhath_Puja_Songs"
OUT = ROOT / "song_stats.json"
KEEP = ("id", "title", "channel", "uploader", "view_count", "like_count", "upload_date",
        "duration", "track", "artist", "artists", "album", "tags", "description")


class Quiet:
    def debug(self, msg): pass
    def info(self, msg): pass
    def warning(self, msg): pass
    def error(self, msg): print(msg, file=sys.stderr)


def fetch(video_id: str) -> dict:
    opts = {"quiet": True, "no_warnings": True, "skip_download": True, "logger": Quiet(), "retries": 3}
    try:
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)
        row = {k: info.get(k) for k in KEEP}
        row["description"] = (row["description"] or "")[:600]
        return row
    except Exception as exc:  # unavailable, private, region-blocked…
        return {"id": video_id, "error": str(exc)[:200]}


def main() -> int:
    ids = [line.split()[1] for line in (SONGS / "downloaded.txt").read_text().splitlines() if line.startswith("youtube ")]
    with ThreadPoolExecutor(max_workers=6) as pool:
        rows = list(pool.map(fetch, ids))
    OUT.write_text(json.dumps({"fetched_at": date.today().isoformat(), "videos": rows}, ensure_ascii=False, indent=1), encoding="utf-8")
    ok = sum(1 for r in rows if "error" not in r)
    print(f"{ok}/{len(rows)} videos fetched -> {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
