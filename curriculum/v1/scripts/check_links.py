#!/usr/bin/env python3
"""Check every URL in data/curriculum.json and write data/link_check.json.

Usage: python3 scripts/check_links.py [curriculum.json] [out.json]

Status values:
  ok          2xx or 3xx response
  dead        404 or 410 (the page is probably gone; confirm in a browser)
  blocked     401, 403, 429, 999 (site refuses scripts; says nothing about the page)
  error       5xx response
  unreachable DNS, TLS or timeout failure
Many sites block scripted requests, so "blocked" is not a failure. Only "dead" and
"unreachable" need a human look.
"""
import json
import ssl
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor

src = sys.argv[1] if len(sys.argv) > 1 else "data/curriculum.json"
dst = sys.argv[2] if len(sys.argv) > 2 else "data/link_check.json"
data = json.load(open(src))

urls = {}
for r in data["resources"]:
    urls.setdefault(r["url"], []).append(r["id"])
for e in data.get("library", []):
    urls.setdefault(e["url"], []).append(e["id"])
for s in data.get("syllabi", []):
    urls.setdefault(s["url"], []).append(s["institution"])

ctx = ssl.create_default_context()
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,*/*;q=0.8",
}


def classify(code):
    if 200 <= code < 400:
        return "ok"
    if code in (404, 410):
        return "dead"
    if code in (401, 403, 429, 999):
        return "blocked"
    if code >= 500:
        return "error"
    return "blocked"


def check(url):
    last = None
    for attempt in range(2):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=20, context=ctx) as resp:
                resp.read(2048)
                return {"status": classify(resp.status), "code": resp.status, "final_url": resp.geturl()}
        except urllib.error.HTTPError as e:
            return {"status": classify(e.code), "code": e.code}
        except Exception as e:  # DNS, TLS, timeout
            last = {"status": "unreachable", "code": None, "error": type(e).__name__ + ": " + str(e)[:120]}
            time.sleep(1.5)
    return last


with ThreadPoolExecutor(max_workers=8) as pool:
    results = dict(zip(urls, pool.map(check, urls)))

summary = {}
for r in results.values():
    summary[r["status"]] = summary.get(r["status"], 0) + 1
out = {"checked": time.strftime("%Y-%m-%d"), "summary": summary, "results": results}
json.dump(out, open(dst, "w"), indent=1)
print(summary)
for u, r in results.items():
    if r["status"] in ("dead", "unreachable"):
        print(r["status"], r.get("code"), u)
