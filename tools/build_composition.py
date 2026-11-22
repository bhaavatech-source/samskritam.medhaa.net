"""Build app/src/data/composition.json from 28-children composition quest datasets."""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SOURCE = os.path.join(ROOT, "data-source", "28-children")
DEST = os.path.join(ROOT, "app", "src", "data", "composition.json")

FILES = {
    "paragraph": "composition_paragraph_quests-v2.json",
    "picture": "composition_picture_quests-v2.json",
    "letter": "composition_letter_quests-v2.json",
}

out = {}
for kind, filename in FILES.items():
    source = json.load(open(os.path.join(SOURCE, filename), encoding="utf-8"))
    quests = []
    for quest in source["quests"]:
        challenge = quest["interactive_challenge"]
        options = []
        answer = ""
        for option in challenge["options"]:
            text = option["text"]
            options.append(text)
            if option.get("is_correct"):
                answer = text
        quests.append({
            "id": quest["quest_id"],
            "level": quest.get("level", ""),
            "type": quest.get("type", ""),
            "title_sa": quest.get("topic_sa") or quest.get("theme_sa") or quest.get("title_sa") or "",
            "title_en": quest.get("topic_en") or quest.get("theme_en") or quest.get("title_en") or "",
            "context": quest.get("context") or quest.get("visual_description") or "",
            "framework": quest.get("structural_framework") or {},
            "subhashita": quest.get("subhashita_integration") or {},
            "manjusha": quest.get("manjusha") or [],
            "templates": quest.get("scaffolding_templates") or [],
            "model": quest.get("model_paragraph") or quest.get("model_composition") or quest.get("model_letter") or [],
            "cloze": quest.get("cloze_text") or [],
            "challenge": {
                "question_sa": challenge.get("question_sa") or "",
                "question_en": challenge.get("question_en") or "",
                "options": options,
                "answer": answer,
                "explanation_en": challenge.get("explanation_en") or "",
                "explanation_hi": challenge.get("explanation_hi") or "",
                "explanation_te": challenge.get("explanation_te") or "",
            },
        })
    out[kind] = {
        "title": source["title"],
        "description": source["description"],
        "total": source["total_quests"],
        "quests": quests,
    }

json.dump(out, open(DEST, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("composition:", {k: v["total"] for k, v in out.items()})
