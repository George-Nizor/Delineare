import json, glob, os, re, collections, shutil, heapq, urllib.parse

SRC = "/home/claude/research_notes/Free drawing curriculum research"
OUT = "/home/claude/drawing-curriculum"
os.makedirs(OUT + "/data/sources", exist_ok=True)

mods = []
for f in sorted(glob.glob(SRC + "/0[1-8]-*.json")):
    mods += json.load(open(f))
# links that returned 404 on 2026-10-13 and were unverified by the researcher
EXCLUDE_URLS = {"https://community.wacom.com/en-au/videos/live-stream-animation-character-design"}
for m in mods:
    m["resources"] = [r for r in m["resources"] if r["url"] not in EXCLUDE_URLS]
    assert len(m["resources"]) >= 2 and any(r["role"] == "core" for r in m["resources"]), m["id"]
by_id = {m["id"]: m for m in mods}
orig_index = {m["id"]: i for i, m in enumerate(mods)}

# ---- prerequisite fixes -------------------------------------------------
REMAP = {
    "fig-anatomy-basics": "fig-simplified-construction",
    "fig-gesture": "fig-gesture-line-of-action",
}
EXTRA = {
    "light-values-squint": ["found-line-control"],
    "light-basic-forms": ["found-basic-shapes"],
    "light-cast-shadows-ao": ["persp-box-basics"],
    "fig-gesture-line-of-action": ["found-line-control"],
    "fig-simplified-construction": ["found-basic-shapes", "persp-box-basics"],
    "fig-head-construction": ["found-basic-shapes"],
    "col-color-light-shadow": ["light-values-squint"],
    "col-digital-painting-fundamentals": ["light-basic-forms"],
    "col-inking-line-art": ["found-line-control"],
}
for m in mods:
    pre = [REMAP.get(p, p) for p in m["prerequisites"]]
    for p in EXTRA.get(m["id"], []):
        if p not in pre:
            pre.append(p)
    m["prerequisites"] = pre

# ---- phases -------------------------------------------------------------
PHASES = [
    (1, "Setup and habits",
     "Materials, posture, a warmup and a sketchbook habit. Short and cheap; most of it fits in the first week.",
     ["found-materials-setup", "found-posture-grip", "found-warmups", "found-practice-method",
      "found-sketchbook-habits", "found-digital-setup"]),
    (2, "Marks, line and gesture",
     "Pen control, confident lines and ellipses, learning to look before drawing, and the start of timed gesture sketching. The play modules start here too and run alongside everything after.",
     ["found-line-control", "found-ellipses", "found-line-weight", "found-basic-shapes",
      "obs-seeing-vs-symbols", "obs-contour-blind-contour", "fig-gesture-line-of-action",
      "fig-timed-gesture-progression", "found-self-assessment", "found-critique-feedback",
      "des-ideation-sketching", "des-reference-visual-library", "des-prompt-challenges",
      "des-surreal-ideation"]),
    (3, "Seeing and measuring",
     "Drawing what is there instead of what you think is there: negative space, measuring, block-in and overlay checks.",
     ["obs-negative-space", "obs-comparative-measuring", "obs-block-in", "obs-sight-size-and-checks",
      "obs-still-life-from-life", "obs-self-critique-error-log", "obs-photo-vs-life",
      "obs-thumbnails-essentials", "obs-visual-memory", "obs-master-copies-bargue"]),
    (4, "Perspective and construction",
     "Boxes, cylinders and complex objects built from simple volumes, then freehand 3D. This is the base for drawing things you cannot look at.",
     ["persp-depth-cues", "persp-box-basics", "persp-parallel-projection", "persp-horizon-vps",
      "persp-one-point", "persp-two-point", "persp-three-point", "persp-ellipses-cylinders",
      "persp-construct-primitives", "persp-measure-scale", "persp-intuitive", "persp-foreshortening",
      "persp-shadows", "persp-slopes", "persp-curvilinear"]),
    (5, "Light, value and form",
     "Value scale, how light behaves on form, edges, cast shadows and what different materials look like, ending in a rendered still life.",
     ["light-values-squint", "light-form-anatomy", "light-basic-forms", "light-media", "light-techniques",
      "light-edges", "light-value-composition", "light-direction-types", "light-cast-shadows-ao",
      "light-materials-textures", "light-line-weight-inking", "light-bargue-cast", "light-invented-light", "light-still-life-render"]),
    (6, "Figure, head and anatomy",
     "Figure construction and proportion, anatomy in short blocks, head and face, hands and feet, drapery, then dynamic poses and the figure from imagination.",
     ["fig-simplified-construction", "fig-proportion-systems-variation", "fig-anatomy-skeleton-muscle",
      "fig-hands", "fig-feet", "fig-head-construction", "fig-facial-features-expressions",
      "fig-portrait-likeness", "fig-hair", "fig-clothing-drapery", "fig-foreshortening-perspective",
      "fig-dynamic-poses-interaction", "fig-master-studies", "fig-life-drawing-session-routine"]),
    (7, "Objects, nature and surfaces",
     "Plants, insects, birds and mammals built from volumes, fur, feather and scale, and everyday, mechanical and organic objects.",
     ["nat-field-sketching-habit", "obs-nature-study-journaling",
      "nat-plants-flowers-trees", "nat-insects-arachnids", "nat-birds", "nat-reptiles-amphibians-fish",
      "nat-mammal-anatomy-construction", "nat-animal-gesture-locomotion-expression",
      "nat-texture-fur-feather-scale", "nat-everyday-objects", "nat-hard-surface-vehicles-machines",
      "nat-food-organic-still-life", "nat-patterns-ornament-surface-detail"]),
    (8, "Space, scenes and composition",
     "Composition, depth, landscape, buildings, streets and the single image that tells a story.",
     ["des-composition-fundamentals", "des-thumbnailing", "des-depth-overlap-atmosphere",
      "nat-landscape-elements", "nat-foliage-trees-in-landscape", "nat-architecture-perspective",
      "nat-streets-cities-urban-clutter", "obs-quick-location-sketching", "des-environment-scene-building",
      "persp-scene-capstone", "des-visual-storytelling"]),
    (9, "Characters, creatures and invention",
     "Shape language, character and creature design, expression, stylisation, and drawing invented things from a visual library.",
     ["des-shape-language-silhouette", "des-character-design-process", "des-costume-props-accessories",
      "des-expression-acting", "des-cartooning-stylisation-caricature", "des-creature-monster-design",
      "nat-creature-design-invented-animals", "persp-imagination", "fig-imagination-visual-library",
      "des-visual-development-workflow"]),
    (10, "Colour, media and finishing",
     "A branch track. Start it any time after phase 5 and run it beside phases 6 to 9. Colour theory, digital painting, individual traditional media, inking, style and sharing your work.",
     ["col-color-theory-basics", "col-color-mixing-limited-palettes", "col-color-light-shadow",
      "col-digital-primer", "col-digital-brushes-layers", "col-digital-painting-fundamentals",
      "col-trad-coloured-pencil", "col-trad-markers", "col-trad-ink-brush-pen", "col-trad-watercolour",
      "col-trad-gouache", "col-trad-charcoal", "col-trad-pastel", "col-inking-line-art",
      "col-color-studies-master-copies", "col-color-script-mood", "col-style-development",
      "col-finishing-portfolio"]),
]
phase_of = {}
for num, _, _, ids in PHASES:
    for i in ids:
        assert i in by_id, i
        assert i not in phase_of, i
        phase_of[i] = num
missing = [i for i in by_id if i not in phase_of]
assert not missing, missing

PLAY = {"des-ideation-sketching", "des-reference-visual-library", "des-prompt-challenges", "des-surreal-ideation"}
OPTIONAL = {
    "found-digital-setup", "persp-parallel-projection", "persp-curvilinear", "light-bargue-cast",
    "obs-master-copies-bargue", "fig-master-studies", "col-trad-coloured-pencil", "col-trad-markers",
    "col-trad-ink-brush-pen", "col-trad-watercolour", "col-trad-gouache", "col-trad-charcoal",
    "col-trad-pastel", "nat-patterns-ornament-surface-detail", "nat-hard-surface-vehicles-machines",
    "light-invented-light",
}
ONGOING = {"fig-life-drawing-session-routine", "found-sketchbook-habits", "nat-field-sketching-habit",
           "obs-nature-study-journaling"}
THIN = {  # modules the researchers reported as having thin free teaching material
    "obs-still-life-from-life", "obs-photo-vs-life", "obs-visual-memory", "nat-reptiles-amphibians-fish",
    "nat-landscape-elements", "nat-hard-surface-vehicles-machines", "nat-food-organic-still-life",
    "nat-patterns-ornament-surface-detail", "persp-imagination", "persp-foreshortening",
    "persp-curvilinear", "fig-facial-features-expressions", "fig-portrait-likeness",
    "fig-foreshortening-perspective", "light-media", "found-ellipses", "des-costume-props-accessories",
    "des-cartooning-stylisation-caricature", "light-bargue-cast", "obs-master-copies-bargue",
}
# light-invented-light is in phase 5 list? add it
if "light-invented-light" not in phase_of:
    raise SystemExit("light-invented-light missing from phases")

# ---- dependency check and ordering --------------------------------------
for m in mods:
    for p in m["prerequisites"]:
        assert p in by_id, (m["id"], p)
bad = []
for m in mods:
    for p in m["prerequisites"]:
        if phase_of[p] > phase_of[m["id"]]:
            bad.append((m["id"], phase_of[m["id"]], p, phase_of[p]))
print("phase violations:", bad)

indeg = {m["id"]: len(m["prerequisites"]) for m in mods}
children = collections.defaultdict(list)
for m in mods:
    for p in m["prerequisites"]:
        children[p].append(m["id"])
heap = [(phase_of[i], orig_index[i], i) for i, d in indeg.items() if d == 0]
heapq.heapify(heap)
order = []
while heap:
    _, _, i = heapq.heappop(heap)
    order.append(i)
    for c in children[i]:
        indeg[c] -= 1
        if indeg[c] == 0:
            heapq.heappush(heap, (phase_of[c], orig_index[c], c))
assert len(order) == len(mods), "cycle in prerequisites"
print("topological order ok", len(order))

# within a phase, keep the order given in PHASES unless a prerequisite requires otherwise
rank = {i: n for n, i in enumerate(order)}
phase_pos = {}
for num, _, _, ids in PHASES:
    for n, i in enumerate(ids):
        phase_pos[i] = n
ordered_ids = []
for num, _, _, ids in PHASES:
    # stable sort by listed position, then fix prerequisites with a local topological pass
    local = list(ids)
    placed = []
    remaining = list(local)
    while remaining:
        progressed = False
        for i in list(remaining):
            if all((p in placed) or (phase_of[p] < num) for p in by_id[i]["prerequisites"]):
                placed.append(i)
                remaining.remove(i)
                progressed = True
                break
        assert progressed, ("local cycle", remaining)
    ordered_ids += placed

# ---- resource index with de-duplication ---------------------------------
def norm(u):
    p = urllib.parse.urlsplit(u.strip())
    host = p.netloc.lower()
    if host.startswith("www."):
        host = host[4:]
    path = p.path.rstrip("/")
    return urllib.parse.urlunsplit((p.scheme.lower() or "https", host, path, p.query, ""))

COST_RANK = {"free": 0, "free-tier": 1, "paid": 2}
res = {}
for m in mods:
    for r in m["resources"]:
        k = norm(r["url"])
        e = res.get(k)
        if e is None:
            res[k] = {
                "title": r["title"], "provider": r["provider"], "credit": r.get("credit", ""),
                "url": r["url"], "format": r["format"], "cost": r["cost"],
                "free_notes": r.get("free_notes", ""), "verified": bool(r.get("verified", False)),
                "last_checked": r.get("last_checked", "2026-10-13"),
            }
        else:
            if COST_RANK.get(r["cost"], 1) > COST_RANK.get(e["cost"], 1):
                e["cost"] = r["cost"]
                e["free_notes"] = r.get("free_notes", "") or e["free_notes"]
            elif len(r.get("free_notes", "")) > len(e["free_notes"]) and r["cost"] == e["cost"]:
                e["free_notes"] = r["free_notes"]
            e["verified"] = e["verified"] and bool(r.get("verified", False))

keys_sorted = sorted(res, key=lambda k: (res[k]["provider"].lower(), res[k]["title"].lower()))
rid_of = {k: "r%03d" % (n + 1) for n, k in enumerate(keys_sorted)}
resources = []
for k in keys_sorted:
    e = dict(res[k])
    e["id"] = rid_of[k]
    resources.append(e)
res_by_id = {r["id"]: r for r in resources}

ROLE_RANK = {"core": 0, "alternative": 1, "supplementary": 2}
out_modules = []
for i in ordered_ids:
    m = by_id[i]
    refs, seen = [], set()
    for r in sorted(m["resources"], key=lambda x: ROLE_RANK.get(x["role"], 3)):
        rid = rid_of[norm(r["url"])]
        if rid in seen:
            continue
        seen.add(rid)
        refs.append({"rid": rid, "role": r["role"], "notes": r.get("notes", "")})
    core = [x for x in refs if x["role"] == "core"]
    core_res = res_by_id[core[0]["rid"]] if core else None
    if i in THIN:
        coverage = "thin"
    elif core_res and core_res["cost"] == "free" and core_res["verified"]:
        coverage = "strong"
    else:
        coverage = "partial"
    out_modules.append({
        "id": i, "title": m["title"], "phase": phase_of[i], "group": m["group"], "level": m["level"],
        "track": "play" if i in PLAY else ("optional" if i in OPTIONAL else "core"),
        "ongoing": i in ONGOING,
        "summary": m["summary"], "prerequisites": m["prerequisites"], "est_hours": m["est_hours"],
        "learning_outcomes": m["learning_outcomes"], "resources": refs, "practice": m["practice"],
        "done_when": m["done_when"], "common_mistakes": m["common_mistakes"],
        "school_reference": m.get("school_reference", []), "free_coverage": coverage,
    })

for m in out_modules:
    if m["track"] == "optional":
        m["tier"] = "optional"
    elif m["level"] == "beginner":
        m["tier"] = "essential"
    elif m["level"] == "intermediate":
        m["tier"] = "deepening"
    else:
        m["tier"] = "stretch"
hours_by_tier = {}
for t in ("essential", "deepening", "stretch", "optional"):
    ms = [m for m in out_modules if m["tier"] == t]
    hours_by_tier[t] = {"modules": len(ms), "hours": [sum(m["est_hours"][0] for m in ms), sum(m["est_hours"][1] for m in ms)]}
print("hours by tier", hours_by_tier)

# ---- providers ----------------------------------------------------------
YT = ("youtube.com", "youtu.be")
prov = collections.defaultdict(lambda: {"names": collections.Counter(), "cost": collections.Counter(), "rids": [], "modules": set()})
used_by = collections.defaultdict(set)
for m in out_modules:
    for r in m["resources"]:
        used_by[r["rid"]].add(m["id"])
for r in resources:
    host = urllib.parse.urlsplit(r["url"]).netloc.lower().replace("www.", "")
    key = r["provider"] if host in YT else host
    p = prov[key]
    p["names"][r["provider"]] += 1
    p["cost"][r["cost"]] += 1
    p["rids"].append(r["id"])
    p["modules"] |= used_by[r["id"]]
providers = []
for key, p in prov.items():
    providers.append({
        "key": key, "name": p["names"].most_common(1)[0][0], "resource_count": len(p["rids"]),
        "module_count": len(p["modules"]), "cost": dict(p["cost"]), "resource_ids": p["rids"],
    })
providers.sort(key=lambda x: (-x["module_count"], -x["resource_count"], x["name"].lower()))

# ---- group 9 ------------------------------------------------------------
g9 = json.load(open(SRC + "/09-sequence-and-practice-library.json"))
GROUP_PHASES = {
    "foundations-habits": [1, 2], "observation-accuracy": [3], "perspective-construction": [4],
    "light-shading-rendering": [5], "figure-anatomy-faces": [6], "nature-objects-architecture": [7],
    "design-composition-characters": [8, 9], "color-media-digital": [10],
}
GATE_PHASE = {
    "foundations-habits": 2, "observation-accuracy": 3, "perspective-construction": 4,
    "light-shading-rendering": 5, "figure-anatomy-faces": 6, "nature-objects-architecture": 7,
    "design-composition-characters": 9, "color-media-digital": 10,
}
for b in g9["benchmarks"]:
    b["after_phase"] = GATE_PHASE[b["after_group"]]
for e in g9["practice_library"]:
    ph = sorted({p for g in e.get("use_for_groups", []) for p in GROUP_PHASES.get(g, [])})
    e["use_for_phases"] = ph

# ---- phases output with hours -------------------------------------------
CONSENSUS_FOR_PHASE = {2: 1, 3: 2, 4: 3, 5: 4, 6: 6, 7: 5, 8: 7, 9: 8}
cons = {c["stage"]: c for c in g9["consensus_sequence"]}
phases_out = []
for num, title, blurb, ids in PHASES:
    ms = [m for m in out_modules if m["phase"] == num]
    core = [m for m in ms if m["track"] in ("core", "play")]
    phases_out.append({
        "number": num, "title": title, "summary": blurb, "module_ids": [m["id"] for m in ms],
        "hours_core": [sum(m["est_hours"][0] for m in core), sum(m["est_hours"][1] for m in core)],
        "hours_all": [sum(m["est_hours"][0] for m in ms), sum(m["est_hours"][1] for m in ms)],
        "syllabus_stage": cons.get(CONSENSUS_FOR_PHASE.get(num)),
    })
tot_core = [sum(p["hours_core"][0] for p in phases_out), sum(p["hours_core"][1] for p in phases_out)]
tot_all = [sum(p["hours_all"][0] for p in phases_out), sum(p["hours_all"][1] for p in phases_out)]

known_gaps = [
    "Drawabox is the most-cited free structured course, and none of its pages could be opened by the research tools (bot check). Every Drawabox entry is marked unverified, and no lesson list beyond what search results confirmed was invented. Open drawabox.com yourself before relying on any Drawabox entry.",
    "The shared web-search budget ran out partway through every research pass, so later checks were direct page opens only. A second pass should cover Drawabox, OpenLearn, non-English sources, free charcoal tutorials, and atelier cast-drawing videos.",
    "Proko lists many lessons as free, but its own pages disagree in places (a lesson page says premium while the course sidebar says free). Every Proko entry is labelled free-tier. Assignments, demos and most critiques are premium.",
    "No complete free set of Bargue plates could be confirmed. The Rijksmuseum has at least one plate with a Public Domain Mark, and Wikimedia Commons has a category that was not verified.",
    "Loomis, Norling and Nicolaides are not linked because no legitimate free copy was found. Bridgman, Vanderpoel, Hatton, Warren and Storey are linked where a legitimate free copy exists.",
    "Reddit communities (r/ArtFundamentals, r/learnart) could not be opened by the research tools, so their current activity is unknown.",
    "Non-English and animation-studio sources are thin. Several university pages (RISD, Pratt, SCAD, ArtCenter, Ringling) did not list individual course content.",
    "Some modules rest on method transfer because no dedicated free course exists (reptiles and fish, rocks and mountains, fire and smoke, ships and aircraft, ornament, turnarounds and model sheets). They are tagged thin.",
    "Benchmark tasks and tolerances (for example the overlay and posterise checks) are the research agent's designs from syllabus assessment criteria, not published standards.",
    "Hour estimates are researcher estimates, not measured. Prices are as displayed on 2026-10-13 and change.",
]

curriculum = {
    "meta": {
        "title": "Draw anything: a free drawing curriculum",
        "generated": "2026-10-13",
        "purpose": "Personal, pointer-only curriculum. Links to teaching and practice material hosted by its owners; nothing is copied or hosted here.",
        "module_count": len(out_modules), "resource_count": len(resources),
        "unverified_resources": sum(1 for r in resources if not r["verified"]),
        "hours_core": tot_core, "hours_all": tot_all, "hours_by_tier": hours_by_tier,
        "free_coverage": dict(collections.Counter(m["free_coverage"] for m in out_modules)),
        "known_gaps": known_gaps,
        "cost_labels": {"free": "Free to use as of last check", "free-tier": "Part free, part paid; read free_notes", "paid": "Paid; listed only as a supplement"},
    },
    "phases": phases_out,
    "modules": out_modules,
    "resources": resources,
    "providers": providers,
    "benchmarks": sorted(g9["benchmarks"], key=lambda b: b["after_phase"]),
    "syllabi": g9["syllabi"],
    "consensus": g9["consensus_sequence"],
    "library": g9["practice_library"],
    "weekly_templates": g9["weekly_templates"],
}
json.dump(curriculum, open(OUT + "/data/curriculum.json", "w"), indent=1, ensure_ascii=False)

for f in glob.glob(SRC + "/*"):
    shutil.copy(f, OUT + "/data/sources/")

print("modules", len(out_modules), "resources", len(resources), "providers", len(providers))
print("hours core", tot_core, "all", tot_all)
print("coverage", curriculum["meta"]["free_coverage"])
print("unverified", curriculum["meta"]["unverified_resources"])
for p in phases_out:
    print(p["number"], p["title"], len(p["module_ids"]), p["hours_core"], p["hours_all"])
print([ (p["name"], p["module_count"], p["resource_count"]) for p in providers[:15]])
