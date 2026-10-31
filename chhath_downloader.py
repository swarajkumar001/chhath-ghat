#!/usr/bin/env python3
"""Download Chhath Puja songs from YouTube as 320 kbps MP3 files.

Usage:
    python chhath_downloader.py <url> [<url> ...] [--playlist] [--output PATH]

Works with single videos and whole playlists. Re-running on the same playlist
only fetches songs that are not in the download archive yet.
"""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path
from typing import Any, Optional

try:
    import yt_dlp
    from yt_dlp.postprocessor import PostProcessor
except ImportError:
    sys.exit("yt-dlp is not installed. Run:  pip install -U yt-dlp")

# --------------------------------------------------------------------------- #
# Settings you may want to edit
# --------------------------------------------------------------------------- #

FOLDER_NAME = "Chhath_Puja_Songs"
ARCHIVE_NAME = "downloaded.txt"
MP3_BITRATE = "320"
MAX_NAME_LENGTH = 150

# Regex patterns (case-insensitive) removed, in order, from video titles before
# they become file names. Add or remove entries to taste.
_TAGS = r"official|video|audio|lyrics?|lyrical|full\s+song|full\s+video|hd|4k|jukebox"
CLUTTER_PATTERNS: list[str] = [
    r"(?:\s*#[^\s#]*)+\s*$",                            # trailing #hashtags #छठ_पूजा
    r"#",                                               # '#' inside a title: keep the word
    rf"\([^()]*\b(?:{_TAGS})\b[^()]*\)",                # (Official Video), (Full HD Song)
    rf"\[[^\[\]]*\b(?:{_TAGS})\b[^\[\]]*\]",            # [Full Song], [Lyrical Video]
    rf"\|\s*(?:official\s+)?(?:{_TAGS})(?:\s+video)?\s*(?=\||$)",  # | Lyrical, | Official Video
    r"\b(?:hd\s+)?video(?:\s+song)?\b",                 # bare "VIDEO", "HD VIDEO", "VIDEO SONG"
]

# --------------------------------------------------------------------------- #

_CLUTTER_RE = [re.compile(p, re.IGNORECASE) for p in CLUTTER_PATTERNS]
_ILLEGAL_RE = re.compile(r'[\\/:*?"<>|\x00-\x1f]')  # not allowed in Windows names
_EMPTY_BRACKETS_RE = re.compile(r"\(\s*\)|\[\s*\]")
_EDGE_JUNK = " .-_,–—"


def clean_title(title: str, fallback: str = "untitled") -> str:
    """Turn a YouTube title into a short, Windows-safe file name (no extension)."""
    name = title
    for pattern in _CLUTTER_RE:
        name = pattern.sub(" ", name)
    name = _ILLEGAL_RE.sub(" ", name)
    name = _EMPTY_BRACKETS_RE.sub(" ", name)
    name = re.sub(r"\s+", " ", name).strip(_EDGE_JUNK)
    if len(name) > MAX_NAME_LENGTH:
        name = name[:MAX_NAME_LENGTH].rstrip(_EDGE_JUNK)
    return name or fallback


class Stats:
    """Counters for the end-of-run summary."""

    def __init__(self) -> None:
        self.downloaded = 0
        self.skipped = 0
        self.failed = 0


class CleanTitlePP(PostProcessor):
    """Runs before download: adds `clean_title` (used in the output template)
    and sets the title/artist tags that FFmpegMetadata writes into the MP3."""

    def run(self, info: dict[str, Any]) -> tuple[list[str], dict[str, Any]]:
        info["clean_title"] = clean_title(info.get("title") or "", info.get("id", "untitled"))
        info["meta_title"] = info["clean_title"]
        artist = info.get("uploader") or info.get("channel")
        if artist:
            info["meta_artist"] = artist
        return [], info


class CountDownloadPP(PostProcessor):
    """Runs after the MP3 is in its final place: counts it as downloaded."""

    def __init__(self, stats: Stats) -> None:
        super().__init__()
        self.stats = stats

    def run(self, info: dict[str, Any]) -> tuple[list[str], dict[str, Any]]:
        self.stats.downloaded += 1
        print(f"  ✔ saved {Path(info['filepath']).name}")
        return [], info


class QuietLogger:
    """Swallows yt-dlp's chatter, but counts archive skips and errors."""

    def __init__(self, stats: Stats) -> None:
        self.stats = stats

    def debug(self, msg: str) -> None:
        if "has already been recorded in the archive" in msg:
            self.stats.skipped += 1
            print(f"  ↷ skip (already downloaded): {msg.removeprefix('[download] ')}")

    def info(self, msg: str) -> None:
        pass

    def warning(self, msg: str) -> None:
        print(f"  ! {msg}")

    def error(self, msg: str) -> None:
        self.stats.failed += 1
        print(f"  ✘ {msg}")


def make_progress_hook():
    """Return a progress_hooks callback that prints one updating line per track."""

    def hook(d: dict[str, Any]) -> None:
        info = d.get("info_dict", {})
        name = (info.get("clean_title") or info.get("title") or "?")[:60]
        idx, total = info.get("playlist_index"), info.get("n_entries")
        prefix = f"[{idx}/{total}] " if idx and total else ""

        if d["status"] == "downloading":
            done = d.get("downloaded_bytes") or 0
            size = d.get("total_bytes") or d.get("total_bytes_estimate")
            pct = f"{done / size * 100:5.1f}%" if size else f"{done / 1_048_576:.1f} MB"
            speed = d.get("speed")
            spd = f"{speed / 1024:7.0f} KiB/s" if speed else ""
            print(f"\r{prefix}{name}  {pct} {spd}   ", end="", flush=True)
        elif d["status"] == "finished":
            print(f"\r{prefix}{name}  100.0%  → converting to MP3...      ")

    return hook


def make_match_filter(out_dir: Path, stats: Stats):
    """Return a match_filter that skips videos whose MP3 already exists."""

    def match_filter(info: dict[str, Any], *, incomplete: bool) -> Optional[str]:
        title = info.get("title")
        if not title:
            return None  # can't tell yet; check again once full info is known
        target = out_dir / f"{clean_title(title, info.get('id', 'untitled'))}.mp3"
        if target.exists():
            stats.skipped += 1
            print(f"  ↷ skip (file exists): {target.name}")
            return f"{target.name} already exists"
        return None

    return match_filter


def build_options(out_dir: Path, stats: Stats, whole_playlist: bool) -> dict[str, Any]:
    """yt-dlp options: best audio -> 320 kbps MP3 with tags and cover art."""
    return {
        "format": "bestaudio/best",
        "paths": {"home": str(out_dir)},
        "outtmpl": "%(clean_title)s.%(ext)s",
        "noplaylist": not whole_playlist,   # watch?v=..&list=.. -> just the video
        "download_archive": str(out_dir / ARCHIVE_NAME),
        "ignoreerrors": True,               # one bad video must not stop a playlist
        "retries": 10,
        "fragment_retries": 10,
        "overwrites": False,
        "writethumbnail": True,
        "noprogress": True,                 # we print our own progress line
        "logger": QuietLogger(stats),
        "progress_hooks": [make_progress_hook()],
        "match_filter": make_match_filter(out_dir, stats),
        "postprocessors": [
            # Thumbnail -> jpg before download, so EmbedThumbnail can use it.
            {"key": "FFmpegThumbnailsConvertor", "format": "jpg", "when": "before_dl"},
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3",
             "preferredquality": MP3_BITRATE},
            {"key": "FFmpegMetadata", "add_metadata": True},
            {"key": "EmbedThumbnail", "already_have_thumbnail": False},
        ],
    }


def check_ffmpeg() -> None:
    """Exit with install instructions if FFmpeg is not on PATH."""
    if shutil.which("ffmpeg"):
        return
    print(
        "ERROR: FFmpeg was not found on your PATH. It is needed to make MP3 files.\n\n"
        "Install it, then CLOSE and REOPEN your terminal:\n"
        "  Windows : winget install --id Gyan.FFmpeg -e\n"
        "  macOS   : brew install ffmpeg\n"
        "  Linux   : sudo apt install ffmpeg   (Debian/Ubuntu)\n\n"
        "Check it works with:  ffmpeg -version",
        file=sys.stderr,
    )
    sys.exit(2)


def parse_args(argv: Optional[list[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Download Chhath Puja songs from YouTube as 320 kbps MP3s."
    )
    parser.add_argument("urls", nargs="*", help="YouTube video or playlist URL(s)")
    parser.add_argument(
        "--playlist", action="store_true",
        help="for a video URL that also has &list=, download the whole playlist",
    )
    parser.add_argument(
        "--output", type=Path, default=Path(__file__).resolve().parent,
        help="folder in which Chhath_Puja_Songs/ is created (default: next to this script)",
    )
    return parser.parse_args(argv)


def main(argv: Optional[list[str]] = None) -> int:
    # Don't crash on consoles that can't show Hindi/emoji characters.
    for stream in (sys.stdout, sys.stderr):
        if hasattr(stream, "reconfigure"):
            stream.reconfigure(errors="replace")

    args = parse_args(argv)
    urls: list[str] = args.urls
    if not urls:
        try:
            url = input("Paste a YouTube video or playlist URL: ").strip()
        except (EOFError, KeyboardInterrupt):
            print()
            return 1
        if not url:
            print("No URL given.", file=sys.stderr)
            return 1
        urls = [url]

    check_ffmpeg()

    out_dir = (args.output.expanduser() / FOLDER_NAME).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    print(f"Saving to: {out_dir}\n")

    stats = Stats()
    try:
        with yt_dlp.YoutubeDL(build_options(out_dir, stats, args.playlist)) as ydl:
            ydl.add_post_processor(CleanTitlePP(), when="pre_process")
            ydl.add_post_processor(CountDownloadPP(stats), when="after_move")
            for url in urls:
                print(f"==> {url}")
                ydl.download([url])
    except KeyboardInterrupt:
        print("\nStopped by user.")

    print(
        "\n----- Summary -----\n"
        f"Downloaded : {stats.downloaded}\n"
        f"Skipped    : {stats.skipped}\n"
        f"Failed     : {stats.failed}\n"
        f"Folder     : {out_dir}"
    )
    return 1 if stats.failed else 0


if __name__ == "__main__":
    sys.exit(main())
