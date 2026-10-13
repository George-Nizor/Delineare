#!/usr/bin/env python3
"""Validate src/data/curriculum.json (version 2) against the curriculum rules.

Run from the repository root:  python3 curriculum/validate.py
Prints every problem found and exits with status 1 if there is any. Standard library only.
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "src", "data", "curriculum.json")
V1 = os.path.join(ROOT, "curriculum", "v1", "curriculum.json")
V2 = os.path.join(ROOT, "curriculum", "v2")
RES = os.path.join(ROOT, "curriculum", "research")

errors = []


def err(msg):
    errors.append(msg)


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


d = load(OUT)
v1 = load(V1)
plan = {p["id"]: p for p in load(os.path.join(V2, "plan.json"))["modules"]}

# ---------------------------------------------------------------- size and top level
size = os.path.getsize(OUT)
if size > 1.5 * 1024 * 1024:
    err(f"output is {size} bytes, over 1.5 MB")
for k in ("version", "meta", "strands", "phases", "modules", "resources", "providers", "syllabi", "library",
          "consensus", "benchmarks", "weekly_templates", "short_session"):
    if k not in d:
        err(f"missing top-level key {k}")
if d.get("version") != 2:
    err("version must be 2")

modules = d["modules"]
M = {m["id"]: m for m in modules}
R = {r["id"]: r for r in d["resources"]}
LIB_TITLES = {e["title"] for e in d["library"]}
STRANDS = {"construct", "observe", "invent"}
if {s["id"] for s in d["strands"]} != STRANDS or len(d["strands"]) != 3:
    err("strands must be exactly construct, observe, invent")

# ---------------------------------------------------------------- module fields
ENUM = {
    "tier": {"essential", "deepening", "stretch", "optional"},
    "track": {"core", "play", "optional"},
    "free_coverage": {"strong", "partial", "thin"},
}
REQUIRED = ["id", "title", "phase", "strand", "tier", "track", "spine", "ongoing", "summary", "prerequisites",
            "est_hours", "ongoing_hours", "learning_outcomes", "lesson", "resources", "practice", "revisit",
            "done_when", "common_mistakes", "school_reference", "free_coverage", "from"]
if len(M) != len(modules):
    err("duplicate module ids")
for m in modules:
    mid = m.get("id", "?")
    for k in REQUIRED:
        if k not in m:
            err(f"{mid}: missing field {k}")
    if m["strand"] not in STRANDS:
        err(f"{mid}: bad strand {m['strand']}")
    for k, allowed in ENUM.items():
        if m[k] not in allowed:
            err(f"{mid}: bad {k} {m[k]}")
    if not (1 <= m["phase"] <= 10):
        err(f"{mid}: bad phase")
    lo, hi = m["est_hours"]
    if not (0 < lo <= hi):
        err(f"{mid}: bad est_hours")
    if m["ongoing_hours"] is not None:
        a, b = m["ongoing_hours"]
        if not (0 < a <= b) or not m["ongoing"]:
            err(f"{mid}: ongoing_hours set but bad or module not ongoing")
    n = len(re.findall(r"[.?](?:\s|$)", m["summary"].strip()))
    if not (2 <= n <= 4):
        err(f"{mid}: summary has {n} sentences (want 2 to 4)")
    if not m["learning_outcomes"]:
        err(f"{mid}: no learning outcomes")
    if not m["resources"]:
        err(f"{mid}: no resources")
    for r in m["resources"]:
        if r["rid"] not in R:
            err(f"{mid}: resource {r['rid']} does not resolve")
        if r["role"] not in ("core", "alternative", "supplementary"):
            err(f"{mid}: bad resource role {r['role']}")
        if not r.get("notes"):
            err(f"{mid}: resource {r['rid']} has no notes")
    if len({r["rid"] for r in m["resources"]}) != len(m["resources"]):
        err(f"{mid}: duplicate resource")
    # plan agreement
    p = plan.get(mid)
    if not p:
        err(f"{mid}: not in plan.json")
    else:
        for k in ("phase", "tier", "track", "spine", "ongoing", "prerequisites", "from", "strand"):
            if p[k] != m[k]:
                err(f"{mid}: {k} differs from plan.json")
if set(plan) != set(M):
    err("module ids differ from plan.json")

# ---------------------------------------------------------------- graph
for m in modules:
    for q in m["prerequisites"]:
        if q not in M:
            err(f"{m['id']}: prerequisite {q} does not exist")
            continue
        if M[q]["phase"] > m["phase"]:
            err(f"{m['id']} (phase {m['phase']}) depends on {q} in later phase {M[q]['phase']}")
        if m["spine"] and not M[q]["spine"]:
            err(f"spine module {m['id']} depends on non-spine {q}")
state = {}


def visit(n, path):
    if state.get(n) == 1:
        err("cycle: " + " -> ".join(path + [n]))
        return
    if state.get(n) == 2:
        return
    state[n] = 1
    for q in M[n]["prerequisites"]:
        if q in M:
            visit(q, path + [n])
    state[n] = 2


for m in modules:
    visit(m["id"], [])

# every v1 module accounted for
v1ids = {m["id"] for m in v1["modules"]}
covered = {f for m in modules for f in m["from"]}
for x in sorted(v1ids - covered):
    err(f"v1 module {x} is not in any module's from")
for x in sorted(covered - v1ids):
    err(f"from lists unknown v1 module {x}")

# ---------------------------------------------------------------- practice, done_when, revisit
KNOWN_URLS = set()
for path in [V1] + [os.path.join(RES, f) for f in sorted(os.listdir(RES)) if f.endswith(".json")]:
    with open(path, encoding="utf-8") as f:
        KNOWN_URLS.update(u.rstrip(".,;") for u in re.findall(r'https?://[^\s"\'<>]+', f.read()))
POSE = set(load(os.path.join(V2, "resources.json"))["pose_sites"])
LIB_ID_TO_TITLE = {e["id"]: e["title"] for e in d["library"]}
POSE_SITES = {LIB_ID_TO_TITLE.get(x, x) for x in POSE}
REF_KINDS = {"life", "photo", "museum", "pose-site", "tool", "prompt", "memory", "none"}
TOOLS = {"light", "form", "mannequin", "grid"}
for m in modules:
    mid = m["id"]
    if not m["practice"]:
        err(f"{mid}: no practice items")
    if not m["done_when"]:
        err(f"{mid}: no done_when items")
    for i, p in enumerate(m["practice"]):
        pid = f"{mid}.p{i + 1}"
        if p.get("id") != pid:
            err(f"{mid}: practice id {p.get('id')} should be {pid}")
        for k in ("title", "description", "dose"):
            if not p.get(k):
                err(f"{pid}: missing {k}")
        if not isinstance(p.get("minutes"), int) or not (1 <= p["minutes"] <= 180):
            err(f"{pid}: minutes must be an integer from 1 to 180")
        if p.get("kind") not in ("exercise", "drill", "study", "play", "benchmark"):
            err(f"{pid}: bad kind {p.get('kind')}")
        t = p.get("timer", {})
        if t.get("mode") == "single":
            if not isinstance(t.get("minutes"), int) or t["minutes"] < 1 or set(t) != {"mode", "minutes"}:
                err(f"{pid}: bad single timer")
        elif t.get("mode") == "ladder":
            steps = t.get("steps") or []
            if not steps or set(t) != {"mode", "steps"} or any(
                    set(s) != {"count", "seconds"} or not isinstance(s["count"], int) or not isinstance(s["seconds"], int)
                    or s["count"] < 1 or s["seconds"] < 5 for s in steps):
                err(f"{pid}: bad ladder timer")
        else:
            err(f"{pid}: bad timer mode")
        ref = p.get("reference", {})
        if set(ref) != {"kind", "query", "tool", "site", "url"}:
            err(f"{pid}: reference keys must be kind, query, tool, site, url")
        if ref.get("kind") not in REF_KINDS:
            err(f"{pid}: bad reference kind {ref.get('kind')}")
        if ref.get("kind") == "tool":
            if ref.get("tool") not in TOOLS:
                err(f"{pid}: tool reference needs tool light, form, mannequin or grid")
        elif ref.get("tool") is not None:
            err(f"{pid}: tool set on a non-tool reference")
        if ref.get("kind") in ("photo", "museum") and not ref.get("query"):
            err(f"{pid}: {ref['kind']} reference needs search words in query")
        if ref.get("kind") in ("life", "prompt", "memory", "none", "tool") and ref.get("query"):
            err(f"{pid}: query set on a {ref['kind']} reference")
        if ref.get("kind") == "pose-site" and ref.get("site") not in POSE_SITES:
            err(f"{pid}: pose-site reference must name a timed pose source, got {ref.get('site')}")
        site = ref.get("site")
        if site is not None and site not in LIB_TITLES and site not in R:
            err(f"{pid}: reference site {site} is neither a library title nor a resource id")
        if ref.get("url") is not None and ref["url"] not in KNOWN_URLS:
            err(f"{pid}: reference url not found in v1 or research JSON: {ref['url']}")
        if ref.get("url") and re.search(r"(www\.|docs\.)blender\.org", ref["url"]) and mid != "simple-3d-blockout":
            err(f"{pid}: Blender reference outside the 3D blockout module")
    for x in m["done_when"]:
        if set(x) != {"text", "kind"} or x["kind"] not in ("judgement", "measured", "process") or not x["text"]:
            err(f"{mid}: bad done_when item {x}")
    rv = m.get("revisit")
    if not rv:
        err(f"{mid}: missing revisit")
    else:
        if set(rv) != {"title", "description", "minutes", "checks"}:
            err(f"{mid}: revisit keys must be title, description, minutes, checks")
        if not isinstance(rv.get("minutes"), int) or not (3 <= rv["minutes"] <= 10):
            err(f"{mid}: revisit minutes must be 3 to 10")
        if not rv.get("checks"):
            err(f"{mid}: revisit has no checks")
        for c in rv.get("checks", []):
            if not isinstance(c, int) or not (0 <= c < len(m["done_when"])):
                err(f"{mid}: revisit check {c} is not a done_when index")
            elif m["done_when"][c]["kind"] == "process":
                err(f"{mid}: revisit check {c} points at a process item, which a single drawing cannot show")

# ---------------------------------------------------------------- lessons
for m in modules:
    mid = m["id"]
    required = not m["from"] or m["free_coverage"] == "thin" or bool(plan[mid].get("lesson_reason"))
    les = m["lesson"]
    if required and les is None:
        err(f"{mid}: lesson required (new, thin or merged with a gap) but missing")
    if not required and les is not None:
        err(f"{mid}: has a lesson but none is required; add a lesson_reason in plan.json or remove it")
    if les is not None:
        if les.get("source") != "original":
            err(f"{mid}: lesson source must be original")
        secs = les.get("sections", [])
        if not (3 <= len(secs) <= 5):
            err(f"{mid}: lesson has {len(secs)} sections (want 3 to 5)")
        words = sum(len((s["heading"] + " " + s["body"]).split()) for s in secs)
        if not (250 <= words <= 600):
            err(f"{mid}: lesson has {words} words (want 250 to 600)")
        for s in secs:
            if not s.get("heading") or not s.get("body"):
                err(f"{mid}: empty lesson section")

# ---------------------------------------------------------------- resources and honesty
v1res = {r["id"]: r for r in v1["resources"]}
for r in d["resources"]:
    if r["evidence"] not in ("opened", "search-result", "unchecked"):
        err(f"{r['id']}: bad evidence {r['evidence']}")
    if r["verified"] and (r["id"] not in v1res or not v1res[r["id"]]["verified"]):
        err(f"{r['id']}: marked verified without an opened check in version 1")
    if r["verified"] and r["evidence"] != "opened":
        err(f"{r['id']}: verified but evidence is {r['evidence']}")
    if r["cost"] not in ("free", "free-tier", "paid"):
        err(f"{r['id']}: bad cost")
    for k in ("id", "title", "provider", "credit", "url", "format", "cost", "free_notes", "verified",
              "last_checked", "link_status", "link_note", "evidence"):
        if k not in r:
            err(f"{r['id']}: missing {k}")
BANNED_URL = [r"archive\.org/details/[^\"]*[Bb]argue", r"[Ll]oomis", r"[Nn]icolaides", r"gutenberg\.org/[^\"]*[Ss]peed",
              r"fadedpage"]
raw = open(OUT, encoding="utf-8").read()
for url in re.findall(r'https?://[^\s"\'<>]+', raw):
    for pat in BANNED_URL:
        if re.search(pat, url):
            err(f"links a source the research says not to link: {url}")

# ---------------------------------------------------------------- authored text style
BAD_CHARS = {"—": "em dash", "–": "en dash", "‘": "curly quote", "’": "curly quote",
             "“": "curly quote", "”": "curly quote"}
for ch, name in BAD_CHARS.items():
    if ch in raw:
        err(f"output contains an {name}")
authored = []
for dirpath, _, files in os.walk(V2):
    for f in sorted(files):
        if f.endswith((".json", ".md")):
            authored.append(os.path.join(dirpath, f))
for path in authored:
    text = open(path, encoding="utf-8").read()
    rel = os.path.relpath(path, ROOT)
    for ch, name in BAD_CHARS.items():
        if ch in text:
            err(f"{rel}: contains an {name}")
    if "!" in text:
        err(f"{rel}: contains an exclamation mark")
    if re.search(r"[\U0001F300-\U0001FAFF☀-➿]", text):
        err(f"{rel}: contains an emoji")
    if re.search(r"\b(left|right)[- ]brain(ed)?\b", text, re.I):
        err(f"{rel}: makes a left-brain or right-brain claim")
    if re.search(r"\b(amazing|awesome|unlock your|master any|game-changer|journey)\b", text, re.I):
        err(f"{rel}: marketing language")

# ---------------------------------------------------------------- phases, benchmarks, templates, meta
phase_ids = [i for ph in d["phases"] for i in ph["module_ids"]]
if sorted(phase_ids) != sorted(M) or len(d["phases"]) != 10:
    err("phases must list every module exactly once across 10 phases")
for ph in d["phases"]:
    for i in ph["module_ids"]:
        if M[i]["phase"] != ph["number"]:
            err(f"{i} listed under phase {ph['number']} but has phase {M[i]['phase']}")
bph = sorted(b["after_phase"] for b in d["benchmarks"])
if bph != list(range(2, 11)):
    err(f"benchmarks should follow phases 2 to 10, got {bph}")
for b in d["benchmarks"]:
    if b.get("includes_imagination_set") is not True or "imagination set" not in b["check"]:
        err(f"{b['id']}: must include the baseline imagination set")
    if any(re.search(r"thumb-width|stranger|in a row|regular sessions", s) for s in b["pass_signs"]):
        err(f"{b['id']}: pass sign needs another person, a streak or a vague unit")
hours_seen = set()
for t in d["weekly_templates"]:
    total = sum(s["minutes"] for s in t["sessions"])
    hours_seen.add(t["hours_per_week"])
    if total != t["hours_per_week"] * 60:
        err(f"{t['id']}: sessions add to {total} minutes, not {t['hours_per_week'] * 60}")
    inv = sum(s["minutes"] for s in t["sessions"] if s["kind"] == "invention")
    mod = sum(s["minutes"] for s in t["sessions"] if s["kind"] in ("module", "review", "gesture", "long"))
    if not (0.30 <= inv / total <= 0.40) or not (0.60 <= mod / total <= 0.70):
        err(f"{t['id']}: split is {mod / total:.0%} module and review, {inv / total:.0%} invention")
    for s in t["sessions"]:
        if s["kind"] not in ("module", "review", "gesture", "invention", "long"):
            err(f"{t['id']}: bad session kind {s['kind']}")
        if s["day"] in ("Tuesday", "Thursday") and (s["minutes"] > 30 or "ptional" not in s["focus"]):
            err(f"{t['id']}: {s['day']} is a jiu-jitsu evening; only a short optional session fits")
if hours_seen != {3, 6, 10}:
    err("weekly templates must cover 3, 6 and 10 hours")
if d["short_session"].get("minutes") != 10:
    err("short_session must be 10 minutes")
meta = d["meta"]
if meta["module_count"] != len(modules) or meta["resource_count"] != len(d["resources"]):
    err("meta counts do not match")
if meta["unverified_resources"] != sum(1 for r in d["resources"] if not r["verified"]):
    err("meta unverified_resources does not match")
spine = [m for m in modules if m["spine"]]
hs = [sum(m["est_hours"][k] for m in spine) for k in (0, 1)]
if meta["hours_spine"] != hs:
    err("meta hours_spine does not match")

# ---------------------------------------------------------------- report
if errors:
    for e in errors:
        print("FAIL", e)
    print(f"{len(errors)} problem(s)")
    sys.exit(1)
print(f"OK: {len(modules)} modules ({len(spine)} spine, {sum(1 for m in modules if m['lesson'])} lessons), "
      f"{len(d['resources'])} resources ({meta['unverified_resources']} unverified), "
      f"{sum(len(m['practice']) for m in modules)} practice items, spine gate hours {hs[0]} to {hs[1]}, "
      f"{size // 1024} KB")
