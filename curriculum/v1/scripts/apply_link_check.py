#!/usr/bin/env python3
"""Copy link-check results from data/link_check.json into data/curriculum.json.

Usage: python3 scripts/apply_link_check.py [curriculum.json] [link_check.json]
Adds link_status (ok | dead | blocked | error | unreachable) and link_checked to every
resource, library entry and syllabus, and updates meta.link_check.
"""
import json
import sys

src = sys.argv[1] if len(sys.argv) > 1 else "data/curriculum.json"
chk = sys.argv[2] if len(sys.argv) > 2 else "data/link_check.json"
c = json.load(open(src))
l = json.load(open(chk))
res = l["results"]

NOTES = {
    "https://www.nma.art/?p=1323667": "Returned 404 on the check date. Search the New Masters Academy site for its live Friday figure drawing session.",
    "https://suayed.fad.unam.mx/wp-content/uploads/2024/12/Desde-otro-punto-de-vista.pdf": "The server's TLS certificate does not match its hostname. The file may open in a browser after a warning; treat with care.",
    "https://www1.rmit.edu.au/courses/C4382VART6406C2145": "The server's TLS certificate had expired on the check date. The page may still open in a browser.",
}


def stamp(entry):
    r = res.get(entry["url"])
    if r is None:
        return
    entry["link_status"] = r["status"]
    entry["link_checked"] = l["checked"]
    if entry["url"] in NOTES:
        entry["link_note"] = NOTES[entry["url"]]


for key in ("resources", "library", "syllabi"):
    for e in c.get(key, []):
        stamp(e)

counts = {}
for key in ("resources", "library", "syllabi"):
    for e in c.get(key, []):
        s = e.get("link_status", "unchecked")
        counts[s] = counts.get(s, 0) + 1
c["meta"]["link_check"] = {
    "date": l["checked"],
    "counts": counts,
    "meaning": {
        "ok": "responded with success or a redirect",
        "blocked": "site refuses scripts (401, 403, 429); says nothing about the page",
        "dead": "404 or 410; link probably gone",
        "error": "5xx response; may be temporary",
        "unreachable": "DNS, TLS or timeout failure",
    },
}
json.dump(c, open(src, "w"), indent=1, ensure_ascii=False)
print(counts)
