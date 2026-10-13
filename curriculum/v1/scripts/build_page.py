#!/usr/bin/env python3
"""Render data/curriculum.json into the curriculum page.

Usage: python3 scripts/build_page.py

Reads  data/curriculum.json and prototype/page_template.html
Writes prototype/site/artifact-content.html (content only, for the Artifact tool)
       prototype/site/index.html            (standalone page, open it in any browser)

The page is self-contained apart from Google Fonts. Progress ticks are kept in the
browser's localStorage and nowhere else.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(ROOT, "data/curriculum.json")))
tpl = open(os.path.join(ROOT, "prototype/page_template.html")).read()

URL_KEYS = {"url", "final_url"}
DASHES = [("\u2014", " - "), ("\u2013", "-"), ("\u2018", "'"), ("\u2019", "'"), ("\u201c", '"'), ("\u201d", '"'), ("\u00a0", " ")]


def clean(v, key=None):
    if isinstance(v, str):
        if key in URL_KEYS:
            return v
        for a, b in DASHES:
            v = v.replace(a, b)
        return re.sub(r" {2,}", " ", v)
    if isinstance(v, list):
        return [clean(x) for x in v]
    if isinstance(v, dict):
        return {k: clean(x, k) for k, x in v.items()}
    return v


data = clean(data)
for p in data["providers"]:
    p.pop("resource_ids", None)

blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
blob = blob.replace("</", "<\\/").replace("<!--", "<\\!--").replace("\u2028", "\\u2028").replace("\u2029", "\\u2029")
assert tpl.count("__DATA__") == 1
content = tpl.replace("__DATA__", blob)

os.makedirs(os.path.join(ROOT, "prototype/site"), exist_ok=True)
open(os.path.join(ROOT, "prototype/site/artifact-content.html"), "w").write(content)

wrapped = (
    '<!doctype html><html lang="en"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>"
    + content
    + "</body></html>"
)
open(os.path.join(ROOT, "prototype/site/index.html"), "w").write(wrapped)
print("artifact-content.html", len(content) // 1024, "KB;", "index.html", len(wrapped) // 1024, "KB")
