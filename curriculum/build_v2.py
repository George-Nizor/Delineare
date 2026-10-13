#!/usr/bin/env python3
"""Build version 2 of the Delineare curriculum.

Reads version 1 (curriculum/v1/curriculum.json), the research passes in curriculum/research/,
and the authored content in curriculum/v2/, and writes src/data/curriculum.json.

Run from the repository root:  python3 curriculum/build_v2.py
Standard library only. The output is deterministic: the same inputs always give the same bytes.

Authored content (curriculum/v2/):
  plan.json            the 96-module plan ported from research/proposal.py (ids, phases, strands, tiers,
                       hours, prerequisites, `from`), plus lesson_reason for merged modules that need notes
  structure.json       strands, phase titles and summaries, short session, meta text (known gaps)
  modules/*.json       one entry per module. Merged, split and new modules carry their full text; one-to-one
                       modules carry only what changes. Items may point at v1 text with references of the
                       form "@<v1 module id>.<o|p|d|m><index>" (outcome, practice, done_when, mistake).
                       "practice_meta" sets minutes, kind, timer and reference for practice items by source
                       reference; anything not set falls back to heuristics. "revisit" holds the revisit task.
  lessons/<id>.md      original lesson notes, "## Heading" sections
  benchmarks.json      phase benchmarks remapped to the new phases
  weekly_templates.json
  resources.json       hand patches to resources and library entries, and how research 02 and 03 apply
"""
import json
import os
import re
import sys
from urllib.parse import urlparse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
V1 = os.path.join(ROOT, "curriculum", "v1", "curriculum.json")
RES = os.path.join(ROOT, "curriculum", "research")
V2 = os.path.join(ROOT, "curriculum", "v2")
OUT = os.path.join(ROOT, "src", "data", "curriculum.json")
GENERATED = "2026-10-13"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def v2file(name):
    return load(os.path.join(V2, name))


# ---------------------------------------------------------------------------------------------
# Inputs
# ---------------------------------------------------------------------------------------------
v1 = load(V1)
V1M = {m["id"]: m for m in v1["modules"]}
plan = v2file("plan.json")["modules"]
PLAN = {p["id"]: p for p in plan}
structure = v2file("structure.json")
mod_text = {}
for name in sorted(os.listdir(os.path.join(V2, "modules"))):
    if name.endswith(".json"):
        for k, v in load(os.path.join(V2, "modules", name)).items():
            if k.startswith("_"):
                continue
            if k in mod_text:
                sys.exit(f"build_v2: module {k} defined twice (modules/{name})")
            mod_text[k] = v
benchmarks_in = v2file("benchmarks.json")
weekly_in = v2file("weekly_templates.json")
res_patch = v2file("resources.json")
verif02 = load(os.path.join(RES, "02-resource-verification.json"))
gaps03 = load(os.path.join(RES, "03-gap-resources.json"))

# Every URL that appears in v1 or the research JSON. Practice references may only use these.
KNOWN_URLS = set()
for path in [V1] + [os.path.join(RES, f) for f in sorted(os.listdir(RES)) if f.endswith(".json")]:
    with open(path, encoding="utf-8") as f:
        KNOWN_URLS.update(u.rstrip(".,;") for u in re.findall(r'https?://[^\s"\'<>]+', f.read()))


def fail(msg):
    sys.exit("build_v2: " + msg)


# ---------------------------------------------------------------------------------------------
# References into v1 text
# ---------------------------------------------------------------------------------------------
REF_RE = re.compile(r"^@([a-z0-9-]+)\.([opdm])(\d+)$")
FIELD = {"o": "learning_outcomes", "p": "practice", "d": "done_when", "m": "common_mistakes"}


def resolve(ref):
    m = REF_RE.match(ref)
    if not m:
        fail("bad reference " + ref)
    mid, kind, idx = m.group(1), m.group(2), int(m.group(3))
    if mid not in V1M:
        fail("reference to unknown v1 module " + ref)
    items = V1M[mid][FIELD[kind]]
    if idx >= len(items):
        fail("reference out of range " + ref)
    item = items[idx]
    if kind == "p":
        item = dict(item)
        item["_src"] = ref
    return item


def text_item(x):
    """A string, a reference string, or {"ref": ..., "text": ...}."""
    if isinstance(x, str):
        return resolve(x) if x.startswith("@") else x
    if "ref" in x:
        base = resolve(x["ref"])
        return x.get("text", base)
    return x["text"]


# ---------------------------------------------------------------------------------------------
# Resources
# ---------------------------------------------------------------------------------------------
RESOURCES = []
RBYID = {}
RBYURL = {}


def add_resource(r):
    RESOURCES.append(r)
    RBYID[r["id"]] = r
    RBYURL[r["url"]] = r


for r in v1["resources"]:
    r = dict(r)
    r.setdefault("link_note", None)
    r["evidence"] = "opened" if r["verified"] else "unchecked"
    add_resource(r)

# Research 02: link fixes, cost corrections, evidence. Nothing here sets verified to true.
DRAWABOX_COST = res_patch["drawabox_cost_note"]
for rec in verif02:
    rid = rec["rid"]
    if rid not in RBYID:
        continue
    r = RBYID[rid]
    status = rec["status"]
    if rec["url_new"] and rec["url_new"] != r["url"]:
        del RBYURL[r["url"]]
        r["url"] = rec["url_new"]
        RBYURL[r["url"]] = r
        if status == "moved" or rid in res_patch["redirect_fixes"]:
            r["link_note"] = res_patch["redirect_note"] + (" " + res_patch["same_content_note"] if rid in res_patch["check_same_content"] else "")
    if status in ("confirmed-by-search", "mismatch") and not r["verified"]:
        r["evidence"] = "search-result"
    if r["provider"] == "Drawabox":
        r["cost"] = "free"
        r["free_notes"] = DRAWABOX_COST + " What search showed (2026-10-13): " + rec["notes"]
        if not r["verified"]:
            r["evidence"] = "search-result"

for rid, patch in sorted(res_patch["resource_patches"].items()):
    r = RBYID[rid]
    for k, v in patch.items():
        if k == "append_free_notes":
            r["free_notes"] = r["free_notes"].rstrip() + " " + v
        elif k == "url":
            del RBYURL[r["url"]]
            r["url"] = v
            RBYURL[v] = r
        else:
            r[k] = v

# Proko single-lesson entries labelled part free: the label cannot be right for one video.
for r in RESOURCES:
    if r["provider"].startswith("Proko") and r["cost"] == "free-tier" and re.search(r"/(course-)?lesson/", r["url"]):
        r["free_notes"] = r["free_notes"].rstrip() + " " + res_patch["proko_single_lesson_note"]

next_id = max(int(r["id"][1:]) for r in RESOURCES) + 1


def new_resource(title, provider, credit, url, fmt, cost, free_notes, evidence):
    global next_id
    if url in RBYURL:
        return RBYURL[url]
    r = {
        "title": title, "provider": provider, "credit": credit, "url": url, "format": fmt, "cost": cost,
        "free_notes": free_notes, "verified": False, "last_checked": GENERATED, "id": "r%03d" % next_id,
        "link_status": "unchecked", "link_checked": None,
        "link_note": "Not link-checked. Found in search results on 2026-10-13; the page was not opened.",
        "evidence": evidence,
    }
    next_id += 1
    add_resource(r)
    return r


# Research 02: the eight new Drawabox entries.
EXTRA_ATTACH = []  # (v1 or v2 module id, rid, role, notes)
for rec in verif02:
    if rec["rid"] != "new":
        continue
    r = new_resource(rec["title"], "Drawabox", "Drawabox (written by the creator who posts as 'Uncomfortable')",
                     rec["url_new"], "course", "free", DRAWABOX_COST + " What search showed (2026-10-13): " + rec["notes"],
                     "search-result")
    for mid in rec["modules"]:
        EXTRA_ATTACH.append((mid, r["id"], None, None))

# Research 03: gap resources. Excluded sources are listed in resources.json and never linked.
EXCLUDED = res_patch["excluded_url_patterns"]
for g in gaps03:
    if any(p in g["url"] for p in EXCLUDED):
        continue
    if g.get("existing_rid"):
        rid = g["existing_rid"]
    else:
        notes = g["free_notes"]
        if g.get("licence_if_known") and g["licence_if_known"] not in ("not stated",):
            notes = notes.rstrip(".") + ". Licence: " + g["licence_if_known"] + "."
        r = new_resource(g["title"], g["provider"], g["credit"], g["url"], g["format"], g["cost"], notes, "search-result")
        rid = r["id"]
    EXTRA_ATTACH.append((g["module_id"], rid, g["role"], g["notes"]))

# ---------------------------------------------------------------------------------------------
# Modules
# ---------------------------------------------------------------------------------------------
# Where each v1 module went. A v1 module split into two v2 modules maps to both.
V1_TO_V2 = {}
for p in plan:
    for f in p["from"]:
        V1_TO_V2.setdefault(f, []).append(p["id"])
GAP_MAP = res_patch["gap_module_map"]  # v1 id -> v2 id where the automatic mapping is ambiguous


def v2_targets(mid, rid):
    if f"{mid}|{rid}" in GAP_MAP:
        return [GAP_MAP[f"{mid}|{rid}"]]
    if mid in GAP_MAP:
        return [GAP_MAP[mid]]
    if mid in PLAN and mid not in V1M:
        return [mid]
    t = V1_TO_V2.get(mid, [])
    if len(t) > 1:
        fail(f"ambiguous attachment of {rid} from {mid}: add it to gap_module_map")
    return t


def norm(s):
    return re.sub(r"[^a-z0-9 ]", "", s.lower()).strip()


def automerge(srcs):
    """Merge v1 modules automatically. Merged modules usually get hand-written text in modules.json."""
    out = {"summary": srcs[0]["summary"], "learning_outcomes": [], "practice": [], "done_when": [],
           "common_mistakes": [], "resources": [], "school_reference": [], "free_coverage": srcs[0]["free_coverage"]}
    seen = {k: set() for k in ("o", "p", "d", "m", "r", "s")}
    for i, m in enumerate(srcs):
        for k, field in (("o", "learning_outcomes"), ("d", "done_when"), ("m", "common_mistakes")):
            for j, x in enumerate(m[field]):
                if norm(x) not in seen[k]:
                    seen[k].add(norm(x))
                    out[field].append(x)
        for j, p in enumerate(m["practice"]):
            if norm(p["title"]) not in seen["p"]:
                seen["p"].add(norm(p["title"]))
                q = dict(p)
                q["_src"] = f"@{m['id']}.p{j}"
                out["practice"].append(q)
        for r in m["resources"]:
            if r["rid"] not in seen["r"]:
                seen["r"].add(r["rid"])
                role = r["role"]
                if i > 0 and role == "core":
                    role = "alternative"
                out["resources"].append({"rid": r["rid"], "role": role, "notes": r["notes"]})
        for s in m["school_reference"]:
            key = s.get("url") or s.get("institution")
            if key not in seen["s"]:
                seen["s"].add(key)
                out["school_reference"].append(s)
    return out


def resource_note(rid, sources):
    """The resource's note from an absorbed module, else from the first v1 module that uses it."""
    for m in list(sources) + v1["modules"]:
        for r in m["resources"]:
            if r["rid"] == rid:
                return r["notes"]
    return None


def build_resources(spec, sources, mid):
    out = []
    for x in spec:
        if isinstance(x, str):
            x = {"rid": x}
        if "url" in x and "rid" not in x:
            if x["url"] not in RBYURL:
                fail(f"{mid}: no resource with url {x['url']}")
            x = dict(x, rid=RBYURL[x["url"]]["id"])
        rid = x["rid"]
        if rid not in RBYID:
            fail(f"{mid}: unknown resource {rid}")
        notes = x.get("notes") or resource_note(rid, sources)
        role = x.get("role")
        if role is None and notes:
            for m in sources:
                for r in m["resources"]:
                    if r["rid"] == rid:
                        role = role or r["role"]
        if not notes or not role:
            fail(f"{mid}: resource {rid} needs role and notes")
        out.append({"rid": rid, "role": role, "notes": notes})
    return out


# ---- practice metadata heuristics (overridden by practice_meta.json) ----------------------------
NUM = {"one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
       "twelve": 12, "fifteen": 15, "twenty": 20, "thirty": 30, "a": 1, "an": 1}


def parse_minutes(dose):
    d = dose.lower()
    m = re.search(r"(\d+)\s*(?:x|times)\s*(\d+)\s*min", d)
    if m:
        return min(int(m.group(1)) * int(m.group(2)), 60)
    m = re.search(r"(\d+)\s*(?:to|-)\s*(\d+)\s*hours?", d)
    if m:
        return 90
    m = re.search(r"(\d+)\s*hours?", d)
    if m:
        return min(int(m.group(1)) * 60, 120)
    m = re.search(r"(\d+)\s*min(?:utes)?\s*each,?\s*(\d+)", d) or re.search(r"(\d+)\s*(?:[a-z ]+?)\s*at\s*(\d+)\s*min", d)
    if m and "each" in d:
        a, b = int(m.group(1)), int(m.group(2))
        return min(a * b, 60)
    m = re.search(r"(\d+)\s*(?:to|-)\s*(\d+)\s*min", d)
    if m:
        return (int(m.group(1)) + int(m.group(2))) // 2
    m = re.search(r"(\d+)\s*min", d)
    if m:
        return int(m.group(1))
    m = re.search(r"(\d+)\s*sec", d)
    if m:
        return max(2, -(-int(m.group(1)) // 60))
    return 20


PLAY_WORDS = ("random", "prompt", "generator", "roll ", "surreal", "ugly", "mash", "exquisite", "invent", "imagination",
              "doodle", "remix", "absurd", "dream", "combine")
DRILL_WORDS = ("drill", "warm", "gesture", "lines", "ellipse", "circle", "pressure", "ladder", "strip", "sweep",
               "table", "boxes", "box ", "ghost", "hatching", "scale", "swatch", "sprint", "timed", "rotation", "sixty-second",
               "one-minute", "funnels", "superimposed", "row")
STUDY_WORDS = ("copy", "copies", "master", "study", "studies", "from life", "photo", "museum", "reference", "observe",
               "plate", "specimen", "life drawing", "outing", "location", "street", "window", "sit spot")


def guess_kind(p, module):
    t = p["title"].lower()
    d = p["description"].lower()
    if module["track"] == "play" or module["strand"] == "invent" and any(w in t for w in PLAY_WORDS):
        return "play"
    if any(w in t for w in DRILL_WORDS):
        return "drill"
    if any(w in t for w in STUDY_WORDS) or any(w in d for w in ("from life", "from a photo", "from photos", "copy ")):
        return "study"
    return "exercise"


LIB = {e["id"]: e for e in v1["library"]}


SITE_TYPES = ("timed-reference", "photo-bank", "museum-open-access", "prompt-list")
# Timed pose and gesture sources: the only valid sites for reference kind "pose-site".
POSE_SITES = set(res_patch["pose_sites"])


def lib_for_url(url):
    """Library entry for a practice reference URL: only reference sites, matched by host."""
    if not url or url in RBYURL:
        return None
    host = urlparse(url).netloc.replace("www.", "")
    for e in v1["library"]:
        eh = urlparse(e["url"]).netloc.replace("www.", "")
        if eh and eh == host and e["type"] in SITE_TYPES:
            return e["id"]
    return None


# Practice reference URLs follow the resource URL fixes from research 02 and the library moves.
URL_FIX = {rec["url_old"]: rec["url_new"] for rec in verif02 if rec["url_old"] and rec["url_new"] and rec["url_old"] != rec["url_new"]}
URL_FIX.update(res_patch.get("url_fixes", {}))


def guess_reference(p, module):
    t = (p["title"] + " " + p["description"]).lower()
    url = p.get("reference_url")
    url = URL_FIX.get(url, url)
    lib = lib_for_url(url)
    site = lib
    if not site and url and url in RBYURL:
        site = RBYURL[url]["id"]
    kind = "none"
    if lib and LIB[lib]["type"] == "timed-reference" and lib in POSE_SITES:
        kind = "pose-site"
    elif site in POSE_SITES:
        kind = "pose-site"
    elif lib and LIB[lib]["type"] == "museum-open-access":
        kind = "museum"
    elif lib and LIB[lib]["type"] == "photo-bank":
        kind = "photo"
    elif lib and LIB[lib]["type"] == "prompt-list":
        kind = "prompt"
    elif any(w in t for w in ("from memory", "without reference", "memory", "recall")):
        kind = "memory"
    elif any(w in t for w in ("museum", "master", "painting", "plate", "bargue", "open-access", "open access")):
        kind = "museum"
    elif any(w in t for w in ("gesture", "poses", "pose ")) and "photo" not in t and (site is None or site in POSE_SITES):
        kind = "pose-site"
        site = site or "loa"
    elif any(w in t for w in ("photo", "reference", "film still", "movie still")):
        kind = "photo"
    elif any(w in t for w in ("from life", "lamp", "real ", "your hand", "mirror", "kitchen", "window", "outdoor",
                              "outside", "household", "table", "set up", "setup", "park", "cafe", "street", "on location")):
        kind = "life"
    elif any(w in t for w in ("invent", "imagination", "prompt", "random", "brief", "idea")):
        kind = "prompt"
    return {"kind": kind, "query": None, "tool": None, "site": site, "url": url}


GESTURE_LADDER = {"mode": "ladder", "steps": [{"count": 10, "seconds": 30}, {"count": 6, "seconds": 60}, {"count": 4, "seconds": 120}]}


def finish_practice(items, module, practice_meta):
    out = []
    qdefault = module.get("_query")
    for i, p in enumerate(items):
        src = p.get("_src")
        pid = f"{module['id']}.p{i + 1}"
        meta = {}
        if src and src in practice_meta:
            meta.update(practice_meta[src])
        meta.update({k: p[k] for k in ("minutes", "kind", "timer", "reference") if k in p})
        for k in ("title", "description", "dose"):
            if k in meta:
                p[k] = meta[k]
        minutes = meta.get("minutes") or parse_minutes(p["dose"])
        kind = meta.get("kind") or guess_kind(p, module)
        ref = guess_reference(p, module)
        if "reference" in meta:
            if meta["reference"].get("kind") and meta["reference"]["kind"] != ref["kind"]:
                u = URL_FIX.get(p.get("reference_url"), p.get("reference_url"))
                ref = {"kind": None, "query": None, "tool": None,
                       "site": RBYURL[u]["id"] if u in RBYURL else lib_for_url(u), "url": u}
            ref.update(meta["reference"])
        ref["url"] = URL_FIX.get(ref.get("url"), ref.get("url"))
        if ref.get("site") and ref["site"].startswith("http"):
            if ref["site"] not in RBYURL:
                fail(f"{pid}: reference site {ref['site']} is not a resource url")
            ref["site"] = RBYURL[ref["site"]]["id"]
        if ref["kind"] == "pose-site" and ref.get("site") not in POSE_SITES:
            fail(f"{pid}: pose-site reference needs a timed pose source as site, got {ref.get('site')}")
        if ref.get("site") in LIB:  # the app reads library entries by title
            ref["site"] = LIB[ref["site"]]["title"]
        elif ref.get("site") and ref["site"] not in RBYID:
            fail(f"{pid}: unknown reference site {ref['site']}")
        if ref["kind"] in ("photo", "museum") and not ref.get("query"):
            ref["query"] = qdefault
        if ref["kind"] not in ("photo", "museum"):
            ref["query"] = ref.get("query") if ref["kind"] in ("pose-site",) else None
        if ref["kind"] != "tool":
            ref["tool"] = None
        timer = meta.get("timer") or {"mode": "single", "minutes": minutes}
        q = {"id": pid, "title": p["title"], "description": p["description"], "dose": p["dose"], "minutes": minutes,
             "kind": kind, "timer": timer,
             "reference": {"kind": ref["kind"], "query": ref.get("query"), "tool": ref.get("tool"),
                           "site": ref.get("site"), "url": ref.get("url")}}
        if src:
            q["_src"] = src
        out.append(q)
    return out


# ---- done_when classification --------------------------------------------------------------------
def guess_dw_kind(text):
    t = text.lower()
    if re.search(r"\b(within|overlay|ratio|ruler|cm\b|mm\b|percent|millimetre|converg|at least \d+ of \d+|greyscale|grayscale|posteri)", t):
        return "measured"
    if re.search(r"\b(at least|completed|have (made|drawn|filled|copied|kept|used|finished|sketched)|sessions|dated pages|"
                 r"entries|\d+ (drawings|pages|sheets|studies|sketches|thumbnails)|photographed|you have a|i have)", t):
        return "process"
    return "judgement"


def finish_done_when(items):
    out = []
    for x in items:
        if isinstance(x, dict) and "kind" in x and "text" in x and "ref" not in x:
            out.append({"text": x["text"], "kind": x["kind"]})
        elif isinstance(x, dict) and "ref" in x:
            text = x.get("text", resolve(x["ref"]))
            out.append({"text": text, "kind": x.get("kind") or guess_dw_kind(text)})
        else:
            text = text_item(x)
            out.append({"text": text, "kind": guess_dw_kind(text)})
    return out


# ---- lessons -----------------------------------------------------------------------------------
def load_lesson(mid):
    path = os.path.join(V2, "lessons", mid + ".md")
    if not os.path.exists(path):
        return None
    with open(path, encoding="utf-8") as f:
        raw = f.read()
    sections = []
    for block in re.split(r"^## ", raw, flags=re.M)[1:]:
        head, _, body = block.partition("\n")
        paras = [re.sub(r"\s*\n\s*", " ", p.strip()) for p in re.split(r"\n\s*\n", body.strip()) if p.strip()]
        sections.append({"heading": head.strip(), "body": "\n\n".join(paras)})
    return {"source": "original", "sections": sections}


# ---- assemble each module ------------------------------------------------------------------------
attach_by_v2 = {}
for mid, rid, role, notes in EXTRA_ATTACH:
    for t in v2_targets(mid, rid):
        url = RBYID[rid]["url"]
        a = res_patch["attach"].get(f"{t}|{url}") or res_patch["attach"].get(url) or {}
        attach_by_v2.setdefault(t, []).append((rid, a.get("role") or role, a.get("notes") or notes))

modules = []
for p in plan:
    mid = p["id"]
    sources = [V1M[f] for f in p["from"]]
    spec = mod_text.get(mid, {})
    if sources and len(sources) == 1 and V1M[p["from"][0]]["id"] == mid:
        base = automerge(sources)
    elif sources:
        base = automerge(sources)
    else:
        base = {"summary": "", "learning_outcomes": [], "practice": [], "done_when": [], "common_mistakes": [],
                "resources": [], "school_reference": [], "free_coverage": "thin"}
    m = {"id": mid, "title": p["title"], "phase": p["phase"], "strand": p["strand"], "tier": p["tier"],
         "track": p["track"], "spine": p["spine"], "ongoing": p["ongoing"]}
    m["summary"] = spec.get("summary", base["summary"])
    m["prerequisites"] = p["prerequisites"]
    m["est_hours"] = p["est_hours"]
    m["ongoing_hours"] = p["ongoing_hours"]
    m["learning_outcomes"] = [text_item(x) for x in spec["learning_outcomes"]] if "learning_outcomes" in spec else base["learning_outcomes"]
    m["lesson"] = load_lesson(mid)
    # resources
    if "resources" in spec:
        res = build_resources(spec["resources"], sources, mid)
    else:
        res = [dict(r) for r in base["resources"]]
        for r in res:
            if r["rid"] in res_patch["module_resource_notes"]:
                r.update(res_patch["module_resource_notes"][r["rid"]])
    for rid, role, notes in attach_by_v2.get(mid, []):
        if rid in spec.get("skip_attach", []) or RBYID[rid]["url"] in spec.get("skip_attach", []):
            continue
        existing = [r for r in res if r["rid"] == rid]
        if existing:
            continue
        if not notes:
            fail(f"{mid}: attached resource {rid} has no notes")
        res.append({"rid": rid, "role": role or "supplementary", "notes": notes})
    order = {"core": 0, "alternative": 1, "supplementary": 2}
    res.sort(key=lambda r: order[r["role"]])
    m["resources"] = res
    # practice
    if "practice" in spec:
        items = []
        for x in spec["practice"]:
            if isinstance(x, str):
                items.append(resolve(x))
            elif "ref" in x:
                q = resolve(x["ref"])
                q.update({k: v for k, v in x.items() if k != "ref"})
                items.append(q)
            else:
                items.append(dict(x))
    else:
        items = [dict(q) for q in base["practice"]]
        for k in spec.get("drop_practice", []):
            items = [q for q in items if q.get("_src") != k]
        for x in spec.get("add_practice", []):
            if "ref" in x:
                q = resolve(x["ref"])
                q.update({k: v for k, v in x.items() if k != "ref"})
                items.append(q)
            else:
                items.append(dict(x))
    m["_query"] = spec.get("query")
    m["practice"] = finish_practice(items, m, spec.get("practice_meta", {}))
    del m["_query"]
    m["revisit"] = spec.get("revisit")
    if not m["revisit"]:
        fail(f"{mid}: missing revisit")
    m["done_when"] = finish_done_when(spec["done_when"]) if "done_when" in spec else finish_done_when(base["done_when"])
    m["common_mistakes"] = [text_item(x) for x in spec["common_mistakes"]] if "common_mistakes" in spec else base["common_mistakes"]
    m["school_reference"] = spec.get("school_reference", base["school_reference"])
    m["free_coverage"] = spec.get("free_coverage", base["free_coverage"])
    m["from"] = p["from"]
    modules.append(m)

MODS = {m["id"]: m for m in modules}

# Keep only resources that are used by a module or were in v1 (v1 entries stay in the catalogue).
used = {r["rid"] for m in modules for r in m["resources"]}
v1ids = {r["id"] for r in v1["resources"]}
RESOURCES = [r for r in RESOURCES if r["id"] in used or r["id"] in v1ids]

# ---------------------------------------------------------------------------------------------
# Library, providers, syllabi
# ---------------------------------------------------------------------------------------------
library = []
for e in v1["library"]:
    e = dict(e)
    for k, v in res_patch["library_patches"].get(e["id"], {}).items():
        e[k] = v
    library.append(e)

syllabi = []
for s in v1["syllabi"]:
    s = dict(s)
    for pat, patch in res_patch["syllabus_patches"].items():
        if pat in s["url"]:
            for k, v in patch.items():
                if k == "append_notes":
                    s["notes"] = s["notes"].rstrip() + " " + v
                else:
                    s[k] = v
    syllabi.append(s)


def provider_key(url):
    return urlparse(url).netloc.lower().replace("www.", "")


old_prov = {pv["key"]: pv for pv in v1["providers"]}
prov_order = [pv["key"] for pv in v1["providers"]]
# v1 resources keep their v1 provider group; a new resource joins a v1 group with the same host,
# otherwise it is grouped under its own provider name.
rid_to_oldkey = {rid: pv["key"] for pv in v1["providers"] for rid in pv["resource_ids"]}
groups = {}
for r in RESOURCES:
    key = rid_to_oldkey.get(r["id"])
    if not key:
        host = provider_key(r["url"])
        key = host if host in old_prov else r["provider"]
    groups.setdefault(key, []).append(r)
providers = []
for key in prov_order + sorted(k for k in groups if k not in old_prov):
    rs = groups.get(key)
    if not rs:
        continue
    ids = [r["id"] for r in rs]
    cost = {}
    for r in rs:
        cost[r["cost"]] = cost.get(r["cost"], 0) + 1
    mods = {m["id"] for m in modules for x in m["resources"] if x["rid"] in ids}
    providers.append({"key": key, "name": old_prov[key]["name"] if key in old_prov else rs[0]["provider"],
                      "resource_count": len(rs), "module_count": len(mods),
                      "cost": dict(sorted(cost.items())), "resource_ids": ids})

# ---------------------------------------------------------------------------------------------
# Phases, benchmarks, templates, meta
# ---------------------------------------------------------------------------------------------
phases = []
for ph in structure["phases"]:
    ids = [p["id"] for p in plan if p["phase"] == ph["number"]]
    phases.append({"number": ph["number"], "title": ph["title"], "summary": ph["summary"], "module_ids": ids})

benchmarks = benchmarks_in["benchmarks"]
weekly_templates = weekly_in["weekly_templates"]


def hsum(ms, field="est_hours"):
    return [sum(m[field][k] for m in ms if m[field]) for k in (0, 1)]


spine = [m for m in modules if m["spine"]]
tiers = {}
for t in ("essential", "deepening", "stretch", "optional"):
    ms = [m for m in modules if m["tier"] == t]
    tiers[t] = {"modules": len(ms), "hours": hsum(ms)}
cov = {}
for m in modules:
    cov[m["free_coverage"]] = cov.get(m["free_coverage"], 0) + 1
link_counts = {}
for r in RESOURCES:
    link_counts[r["link_status"]] = link_counts.get(r["link_status"], 0) + 1

meta = {
    "title": "Delineare curriculum",
    "generated": GENERATED,
    "version": 2,
    "purpose": v1["meta"]["purpose"],
    "module_count": len(modules),
    "spine_count": len(spine),
    "lesson_count": sum(1 for m in modules if m["lesson"]),
    "resource_count": len(RESOURCES),
    "unverified_resources": sum(1 for r in RESOURCES if not r["verified"]),
    "evidence_counts": {k: sum(1 for r in RESOURCES if r["evidence"] == k) for k in ("opened", "search-result", "unchecked")},
    "hours_spine": hsum(spine),
    "ongoing_hours_spine": hsum([m for m in spine if m["ongoing_hours"]], "ongoing_hours"),
    "hours_core": hsum([m for m in modules if m["track"] != "optional"]),
    "hours_all": hsum(modules),
    "hours_by_tier": tiers,
    "hours_note": structure["hours_note"],
    "free_coverage": dict(sorted(cov.items())),
    "known_gaps": structure["known_gaps"],
    "cost_labels": v1["meta"]["cost_labels"],
    "evidence_labels": structure["evidence_labels"],
    "link_check": {
        "date": v1["meta"]["link_check"]["date"],
        "counts": dict(sorted(link_counts.items())),
        "meaning": dict(v1["meta"]["link_check"]["meaning"], **structure["link_meaning_extra"]),
    },
    "research": "Round 1, 2026-10-13: seven passes, most evidence from search results; see docs/CURRICULUM.md",
}

# List items read as fragments: drop a trailing full stop so v1 and v2 items look alike.
for m in modules:
    m["learning_outcomes"] = [x.rstrip(".") for x in m["learning_outcomes"]]
    m["common_mistakes"] = [x.rstrip(".") for x in m["common_mistakes"]]
    for x in m["done_when"]:
        x["text"] = x["text"].rstrip(".")

# Strip private keys
for m in modules:
    for q in m["practice"]:
        q.pop("_src", None)

out = {
    "version": 2,
    "meta": meta,
    "strands": structure["strands"],
    "phases": phases,
    "modules": modules,
    "resources": RESOURCES,
    "providers": providers,
    "syllabi": syllabi,
    "library": library,
    "consensus": v1["consensus"],
    "benchmarks": benchmarks,
    "weekly_templates": weekly_templates,
    "short_session": structure["short_session"],
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(out, f, ensure_ascii=False, separators=(",", ":"))
    f.write("\n")
print(f"wrote {os.path.relpath(OUT, ROOT)}: {len(modules)} modules, {len(spine)} spine, "
      f"{meta['lesson_count']} lessons, {len(RESOURCES)} resources ({meta['unverified_resources']} unverified), "
      f"{os.path.getsize(OUT) // 1024} KB")
