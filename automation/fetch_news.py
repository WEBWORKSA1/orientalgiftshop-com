"""Fetch recent gifting and Asian-festival headlines into assets/data/news.json.
Run by GitHub Actions (see automation/update-news.yml). Standard library only."""
import email.utils
import json
import os
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
QUERIES = [
    "Lunar New Year gifts", "Diwali gifts", "Mid-Autumn mooncakes", "Chuseok gift sets",
    "Japanese gift giving", "red envelope hongbao", "Asian gift guide",
]
items, seen = [], set()
for q in QUERIES:
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q + " when:30d", "hl": "en-US", "gl": "US", "ceid": "US:en"})
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "OrientalGiftShop.com news bot"})
        root = ET.fromstring(urllib.request.urlopen(req, timeout=20).read())
    except Exception as exc:  # keep going if one feed fails
        print("skip", q, exc)
        continue
    for it in list(root.iter("item"))[:6]:
        title = (it.findtext("title") or "").strip()
        link = (it.findtext("link") or "").strip()
        src = it.find("source")
        source = src.text.strip() if src is not None and src.text else ""
        if source and title.endswith(" - " + source):
            title = title[: -len(source) - 3]
        key = title.lower()[:60]
        if not title or not link or key in seen:
            continue
        seen.add(key)
        try:
            d = email.utils.parsedate_to_datetime(it.findtext("pubDate"))
            ts, date = d.timestamp(), d.strftime("%b %d, %Y")
        except Exception:
            ts, date = 0, ""
        items.append({"title": title, "url": link, "source": source, "date": date, "_ts": ts})

items.sort(key=lambda x: -x["_ts"])
for i in items:
    i.pop("_ts")
if len(items) >= 3:
    json.dump(items[:24], open(os.path.join(ROOT, "assets/data/news.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("wrote", min(len(items), 24), "items")
else:
    print("not enough items; leaving news.json unchanged")
