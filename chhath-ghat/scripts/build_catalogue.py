"""Build src/data/catalogue.json from scripts/song_stats.json and the downloaded MP3s.

Measured (from YouTube, snapshot date in the file): views, likes, upload date, channel.
Derived from the video's own title/tags/description, with the evidence recorded:
  - language (Bhojpuri / Maithili) — only when the video says so
  - Usha Arghya — the title names sunrise (उग / उगी / सुरुज / बिहान …)
  - Sandhya Arghya — the song's name names the evening offering, the daura/bahangi carried to the ghat, or kosi bharai
Editorial (our curation, labelled as such on the site):
  - "traditional": folk/paramparik songs and Sharda Sinha's recordings
  - display titles in DISPLAY_TITLES below

Songs whose metadata never mentions Chhath are left out (they're kept on disk, just not listed).

    ..\\venv\\Scripts\\python scripts\\build_catalogue.py
"""
from __future__ import annotations

import difflib
import json
import math
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PROJECT = ROOT.parent
SONGS = PROJECT.parent / "Chhath_Puja_Songs"
sys.path.insert(0, str(PROJECT.parent))
from chhath_downloader import clean_title  # noqa: E402  (same naming rule the files were saved with)

CHHATH = re.compile(r"chhath|chhat|chath|छठ|छठी|chhathi|arghya|aragh|अरघ|अर्घ|suruj|suraj|सुरुज|सूरज|dinanath|deenanath|दीनानाथ|"
                    r"bahangi|बहंगी|बहँगी|kosi|कोसी|कोशी|daura|दउरा|ghat|घाट", re.I)
MAITHILI = re.compile(r"maithili(?!\s*thakur)|मैथिली(?!\s*ठाकुर)", re.I)
BHOJPURI = re.compile(r"bhojpuri|भोजपुरी", re.I)
USHA = re.compile(r"\bug[aiu]?\b|\buga\b|\bugi\b|उग|उगी|उगा|\bbihaan|बिहान|bhor\b|भोर|\busha\b|उषा|morning|सुबह|uthau|उठऽ|उठउ", re.I)
# Sandhya day: the evening offering, carrying the daura/bahangi to the ghat, and kosi bharai that night.
SANDHYA = re.compile(r"sandhya|संध्या|sanjh|साँझ|सांझ|evening|doobat|डूबत|bahangi|बहंगी|बहँगी|बहंगिया|daura|दउरा|"
                     r"kosi|kosiya|koshi|कोसी|कोशी|कोशिया|कोसिया|घाटे\s*चली|ghat\s*chali", re.I)
TRADITIONAL = re.compile(r"traditional|paramparik|पारंपरिक|पारम्परिक|lok\s*geet|लोकगीत|folk", re.I)

SINGERS = [
    ("Sharda Sinha", r"sharda\s*sinha|शारदा\s*सिन्हा"), ("Anuradha Paudwal", r"anuradha\s*paudwal|अनुराधा\s*पौडवाल"),
    ("Kavita Paudwal", r"kavita\s*paudwal"), ("Kalpana Patowary", r"kalpana|kalpna|कल्पना"),
    ("Pawan Singh", r"pawan\s*singh|पवन\s*सिंह"), ("Khesari Lal Yadav", r"khesari|खेसारी"),
    ("Sonu Nigam", r"sonu\s*nigam"), ("Khushboo Jain", r"khushboo\s*jain"), ("Devi", r"\bdevi\b"),
    ("Maithili Thakur", r"maithili\s*thakur|मैथिली\s*ठाकुर"), ("Manoj Tiwari", r"manoj\s*ti[wv]ari|मनोज\s*तिवारी"),
    ("Ritesh Pandey", r"ritesh\s*pandey"), ("Neelkamal Singh", r"neel\s*kamal|neelkamal"),
    ("Arvind Akela Kallu", r"kallu|arvind\s*akela"), ("Nisha Upadhyay", r"nisha"), ("Antra Singh Priyanka", r"antra\s*singh"),
    ("Priyanka Singh", r"(?<!antra\s)priyanka\s*singh"), ("Samar Singh", r"samar\s*singh"), ("Shilpi Raj", r"shilpi\s*raj"),
    ("Ankush Raja", r"ankush\s*raja"), ("Om Prakash Diwana", r"om[\s_]*prakash[\s_]*diwana"), ("Anu Dubey", r"anu[\s_]*dubey"),
    ("Alok Jha", r"alok\s*jha"), ("Rani Manjit Kaur", r"manjit\s*kaur"), ("Amit Jha", r"amit\s*jha"),
    ("Sannu Kumar", r"sannu\s*kumar"), ("Chandan Tiwari", r"chandan\s*tiwari"), ("Vishal Mishra", r"vishal\s*mishra"),
]

FULL_NAMES = [r"khesari\s*lal\s*yadav", r"खेसारी\s*लाल(\s*यादव)?", r"pawan\s*singh", r"पवन\s*सिंह", r"arvind\s*akela(\s*kallu(\s*ji)?)?",
              r"kallu\s*ji", r"kajal\s*raghwani", r"raj\s*giri", r"nisha\s*ji", r"by\s*$", r"\bby\b", r"sharda\s*sinha", r"शारदा\s*सिन्हा"]

# Editorial: readable names for songs whose YouTube titles are mostly keywords. Keyed by video ID.
DISPLAY_TITLES: dict[str, str] = {
    "6e6Hp6R5SVU": "उग हे सूरज देव",
    "BKoD7bTLc2k": "जोड़े जोड़े फलवा",
    "wOdnKS7Hhtw": "छठ महापर्व भक्ति गीत",
    "Kc0D3A5Rcd8": "छपरा मे छठ मनाएंगे",
    "knZ8b5YnQiY": "केलवा के पात पर (नया संस्करण)",
    "OERYH8EC1hA": "अनु दुबे का छठ गीत",
    "j9G3caThH98": "उठऽ सुरुज भइले बिहान",
    "18JGG4WIBzE": "Chhath Kare Jaib Naihar Mein",
    "CGQ-3EFVZfA": "छठ पूजा के गीत",
    "dIunnrgd3ks": "छठ पूजा के गीत",
    "Dd_KAUMoKbY": "धनिया हमार नया बाड़ी हो",
    "T_YXL_blE3A": "दर्शन देखाई दीही",
    "x1pC76gulhE": "A Khesari Ahire Ho",
    "QeHryT9y3h8": "Na Sajanwa Aile Ho",
    "O6_zsmdS0dU": "शारदा सिन्हा के छठ गीत",
    "GMQGZjFn6-4": "छठ पूजा गीत — नॉन-स्टॉप",
    "nCM2PIB7fYA": "A Khesari Ahire Ho",
    "oapoZrQsoSs": "छठी मईया (घर घर की पसंद)",
    "VkcGr1AT4Zo": "दर्शन देखाई दीही (लिरिकल)",
    "fwX2g9jjo1o": "Sona Satkuniya Ho Dinanaath",
    "rOo9hgfq3e0": "बेस्ट ऑफ़ शारदा सिन्हा",
    "u2rkSu5LYbk": "सुरुज भइले बिहान",
    "r8KJwcR5o40": "रितेश पांडेय का छठ गीत",
    "B-JSzoDdDDI": "चननी तनाए लागल",
    "z-W9mJFFTaU": "मनोज तिवारी और उनकी माताजी का छठ गीत",
    "A1c49vp_5rc": "छठ करे आवतानी",
    "u04rkJ8G_Fc": "जोड़े जोड़े नारियल (लाइव)",
    "GRC19OaLLUo": "Chhathi Maiya",
    "ip5syjhzmuA": "Ara Chapra Ke Ghat Nik Lagela",
    "1xv4kLBlJGQ": "शारदा सिन्हा के अमर छठ गीत",
    "EhIp5GDM-vo": "Bahangiya Lachkat Ghate Jala",
    "r37GyTxkeN0": "छठ पूजा गीत — नॉन-स्टॉप",
    "ulR0q7um1sM": "Suruj Dev Daras Dekhai",
    "Rd2CXTqeABE": "Maiya Ho Chhathi Maiya",
    "s8frREl70TE": "मनोज तिवारी का छठ गीत (लाइव)",
    "SH1n2uGY5-A": "छठ के दिनवा — नॉन-स्टॉप",
    "FL6V98nMy00": "छठ गीत",
    "ZTSwqNa96aI": "कल्पना के हिट छठ गीत",
    "VaEbm3jW4rs": "चननी तनाए लागल",
    "KmojxAcHocM": "Humahu Jaib Chhathi Ghat",
    "1m9c9fWDuvY": "Piya Chhath Kare Jaaibi Naihar Mein",
    "B5zgU3Q7Gp8": "Ugi Ugi Dinanath Daras Dekhai",
    "CcDdbFuetM0": "Maiya Ke Mahima Bhari",
    "_G5QfnXIi04": "छठी माई होइहे सहाये (लाइव)",
}

# Segments that are promotion, not a song name. (Python's \b misreads Devanagari vowel signs, so match on spaces.)
PROMO = re.compile(r"सबसे|बजने|पसंद|सुपरहिट|धाकड़|ने गाया|का ये|^(?:का|के)(?:\s|$)|के गीत$|^गीत$|भक्ति गीत|nonstop|जूकबॉक्स|अमर", re.I)
NOISE = re.compile(
    r"#\S*|\b(?:new|latest|superhit|super\s*hit|hit|full|hd|official|video|audio|song|songs|geet|gana|jukebox|lyrics?|with|"
    r"bhojpuri|maithili|chhath|chhat|chath|puja|pooja|special|status|shorts?|t-series|\d{4}|i)\b|छठ\s*गीत|छठ\s*पूजा|भोजपुरी",
    re.I,
)


def display_title(title: str, singer_res: list[str]) -> str:
    parts = [p.strip(" -–—:|,.'\"") for p in re.split(r"\s[|I]\s|\||\s[-–—]\s|:|,", title)]
    best = ""
    for part in parts:
        text = re.sub(r"\s+", " ", NOISE.sub(" ", part)).strip(" -–—|,.@")
        for rx in singer_res + FULL_NAMES:
            text = re.sub(rx, " ", text, flags=re.I)
        text = re.sub(r"\s+", " ", text).strip(" -–—|,.&")
        text = re.sub(r"^(?:का|के|की)\s+|\s+(?:का|के|की)$|\[\s*\]|\(\s*\)|[🙏]+", " ", text).strip(" -–—|,.&")
        text = re.sub(r"\s+", " ", text)
        if len(text) < 3 or PROMO.search(text):
            continue
        if re.search(r"[ऀ-ॿ]", text):  # prefer the Devanagari name of the song
            return text
        best = best or text
    return best or title


def tidy(text: str) -> str:
    """ALL-CAPS English names → Title Case."""
    return text.title() if text.isupper() else text


def main() -> int:
    stats = json.loads((ROOT / "song_stats.json").read_text(encoding="utf-8"))
    files = sorted(p.name for p in SONGS.glob("*.mp3"))
    by_clean = {f[:-4]: f for f in files}
    songs, skipped, unmatched = [], [], []
    for v in stats["videos"]:
        if "error" in v:
            continue
        text = " ".join([v["title"], " ".join(v.get("tags") or []), v.get("description") or ""])
        clean = clean_title(v["title"], v["id"])
        file = by_clean.get(clean)
        if not file:
            close = difflib.get_close_matches(clean, list(by_clean), n=1, cutoff=0.85)
            file = by_clean[close[0]] if close else None
        if not file:
            unmatched.append(v["title"])
            continue
        if not CHHATH.search(v["title"] + " " + " ".join(v.get("tags") or [])):
            skipped.append(v["title"])
            continue
        singers = [name for name, rx in SINGERS if re.search(rx, v["title"], re.I)][:3]
        singer_res = [rx for name, rx in SINGERS if name in singers]
        lang, lang_ev = None, None
        if MAITHILI.search(text):
            lang, lang_ev = "maithili", "मैथिली (वीडियो विवरण)"
        elif BHOJPURI.search(text):
            lang, lang_ev = "bhojpuri", "भोजपुरी (वीडियो विवरण)"
        title = DISPLAY_TITLES.get(v["id"]) or tidy(display_title(v["title"], singer_res))
        # Only the song's own name counts (album names like "Bahangi" would mislabel every track on it).
        arghya = "usha" if USHA.search(title) else "sandhya" if SANDHYA.search(title) else None
        sharda = "Sharda Sinha" in singers
        traditional = bool(TRADITIONAL.search(v["title"])) or sharda
        duration = v.get("duration") or 0
        songs.append({
            "id": v["id"],
            "title": title,
            "youtubeTitle": v["title"],
            "singers": singers,
            "channel": v.get("channel") or v.get("uploader"),
            "views": v.get("view_count") or 0,
            "likes": v.get("like_count"),
            "uploaded": v.get("upload_date"),
            "duration": duration,
            "compilation": duration > 20 * 60,
            "file": file,
            "lang": lang,
            "langEvidence": lang_ev,
            "arghya": arghya,
            "traditional": traditional,
            "traditionalReason": "sharda" if sharda else "title" if traditional else None,
        })
    songs.sort(key=lambda s: -s["views"])
    top = math.log10(max(s["views"] for s in songs) + 1)
    for rank, s in enumerate(songs, 1):
        s["rank"] = rank
        s["score"] = round(100 * math.log10(s["views"] + 1) / top)  # 0–100, log scale of measured views
    out = {
        "fetchedAt": stats["fetched_at"],
        "source": "YouTube view counts, fetched with yt-dlp",
        "songs": songs,
    }
    (PROJECT / "src" / "data" / "catalogue.json").write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"{len(songs)} songs listed, {len(skipped)} left out (no Chhath mention), {len(unmatched)} without a file")
    for t in skipped:
        print("  left out:", t[:90])
    for t in unmatched:
        print("  no file :", t[:90])
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
