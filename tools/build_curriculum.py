"""Build app/src/data/curriculum.json from the 28-children audience curricula."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "data-source", "28-children")
DEST = os.path.join(ROOT, "app", "src", "data", "curriculum.json")

FILES = {
    "school": "for-school-children.json",
    "college": "for-college-students (1).json",
    "university": "for-university-students.json",
}


def theory_text(key, value):
    if isinstance(value, str):
        return value
    if isinstance(value, list):
        out = []
        for item in value:
            if isinstance(item, str):
                out.append(item)
            elif isinstance(item, dict):
                primary = item.get("nyaya_name") or item.get("vibhakti") or item.get("lakara") or item.get("term") or item.get("name_sa") or item.get("title_sa") or ""
                secondary = item.get("meaning_en") or item.get("meaning_sa") or item.get("name_en") or item.get("title_en") or item.get("karaka") or item.get("definition") or ""
                extras = []
                for extra_key in ("examples", "key_upapadas", "lakara_definitions", "rules"):
                    extra = item.get(extra_key)
                    if isinstance(extra, list):
                        extras.extend(str(v) for v in extra)
                    elif isinstance(extra, str):
                        extras.append(extra)
                out.append(" — ".join(x for x in (str(primary), str(secondary), " · ".join(extras)) if x))
        return out
    if isinstance(value, dict):
        out = []
        for name, item in value.items():
            if isinstance(item, str):
                out.append(item)
            elif isinstance(item, dict):
                parts = [str(v) for v in item.values() if isinstance(v, str)]
                if parts:
                    out.append(" · ".join(parts))
            elif isinstance(item, list):
                out.append(" · ".join(str(v) for v in item))
        return out
    return str(value)


def normalize_challenge(raw, module_id):
    options = []
    answer = ""
    for option in raw.get("options", []):
        text = option.get("text", "")
        options.append(text)
        if option.get("is_correct"):
            answer = text
    return {
        "id": raw.get("challenge_id") or raw.get("id") or f"{module_id}-question",
        "topic": raw.get("topic") or "",
        "prompt_sa": raw.get("prompt_sa") or "",
        "prompt_en": raw.get("prompt_en") or "",
        "options": options,
        "answer": answer,
        "explanation_sa": raw.get("explanation_sa") or "",
        "explanation_en": raw.get("explanation_en") or "",
        "explanation_hi": raw.get("explanation_hi") or "",
        "explanation_te": raw.get("explanation_te") or "",
        "points": raw.get("points") or 10,
    }


tracks = {}
for level, filename in FILES.items():
    source = json.load(open(os.path.join(SOURCE, filename), encoding="utf-8"))
    modules = []
    for module in source["modules"]:
        name_sa = module.get("name_sa") or module.get("title_sa") or ""
        name_en = module.get("name_en") or module.get("title_en") or ""
        description = module.get("description_en") or module.get("overview_en") or ""
        theory = []
        for key, value in module.items():
            if key in ("module_id", "name_sa", "title_sa", "name_en", "title_en",
                       "description_en", "overview_en", "challenges"):
                continue
            result = theory_text(key, value)
            if isinstance(result, list):
                theory.extend(result)
            elif result:
                theory.append(result)
        challenges = [normalize_challenge(c, module["module_id"]) for c in module.get("challenges", [])]
        modules.append({
            "id": module["module_id"],
            "name_sa": name_sa,
            "name_en": name_en,
            "description": description,
            "theory": theory,
            "challenges": challenges,
        })
    tracks[level] = {
        "title": source["title"],
        "audience": source["target_audience"],
        "level": source.get("curriculum_level") or "",
        "description": source["description"],
        "modules": modules,
    }

json.dump(tracks, open(DEST, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("curriculum:", {k: (len(v["modules"]), sum(len(m["challenges"]) for m in v["modules"])) for k, v in tracks.items()})
