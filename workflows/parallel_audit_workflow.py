"""
Multi-Agent Parallel Audit & Brainstorm Orchestrator (`workflows/parallel_audit_workflow.py`)
----------------------------------------------------------------------------------------------
Script ini adalah contoh nyata penggunaan `run_workflow` di Antigravity (Mind-Map Sub-Agent):
- Membaca proyek aktif dari `active_project.json`
- Phase 1: Mengerahkan 3 Sub-Agent spesialis secara PARALEL (`parallel()`) untuk mengaudit
  3 aspek berbeda dari proyek aktif sekaligus:
    1. Story & Retention Critic (Skill 01 & 02)
    2. Audio & Semantic Caption Critic (Skill 03)
    3. Visual & Sat-Set Pacing Critic (Skill 04, 05 & 06)
- Phase 2: Lead Strategist menggabungkan temuan ke-3 Sub-Agent dan memperbarui `hub/BRAINSTORM.md`.
"""

import json

with open("active_project.json", "r", encoding="utf-8") as f:
    active_cfg = json.load(f)

project_slug = active_cfg.get("activeProject", "_template")
project_dir = f"projects/{project_slug}"

log(f"Memulai Multi-Agent Parallel Audit untuk proyek aktif: {project_slug}")

phase("1. Parallel Sub-Agent Audit (3 Spesialis Bekerja Serentak)")

audit_angles = [
    {
        "role": "Story & Retention Critic",
        "files": f"{project_dir}/01_brief.json dan {project_dir}/02_script.json",
        "focus": "Kekuatan Hook 3 detik pertama, Open Loop tiap 15-20 detik, Payoff akhir, dan kualitas semanticChunks (2-5 kata utuh)."
    },
    {
        "role": "Audio & Caption Sync Critic",
        "files": f"{project_dir}/03_audio_timestamps.json dan {project_dir}/qa_report.md",
        "focus": "Kelancaran transisi antar-frasa captionChunks, kepadatan durasi bicara VO, dan bebas kata depan menggantung."
    },
    {
        "role": "Visual & Sat-Set Motion Critic",
        "files": f"{project_dir}/04_storyboard.json dan {project_dir}/theme_config.json",
        "focus": "Kecepatan transisi 12-15 frames, kepadatan visual beat <= 150 frames (2.5s), variasi kamera, dan kepatuhan Safe Zone."
    }
]

reviews = await parallel(
    audit_angles,
    lambda item: agent(
        prompt=(
            f"Kamu adalah {item['role']} untuk proyek motion graphic `{project_slug}`.\n"
            f"Baca file `{item['files']}`.\n"
            f"Evaluasi secara tajam fokus berikut: {item['focus']}\n"
            "Berikan output singkat dalam 3 poin: (1) Skor 1-10, (2) Apa yang sudah paling kuat, "
            "(3) 1 rekomendasi upgrade spesifik untuk iterasi berikutnya."
        ),
        schema={
            "type": "object",
            "properties": {
                "role": {"type": "string"},
                "score": {"type": "number"},
                "strength": {"type": "string"},
                "upgrade_recommendation": {"type": "string"}
            },
            "required": ["role", "score", "strength", "upgrade_recommendation"]
        },
        role=item["role"]
    )
)

for r in reviews:
    log(f"[{r['role']}] Skor: {r['score']}/10 | Upgrade: {r['upgrade_recommendation']}")

phase("2. Sintesis ke hub/BRAINSTORM.md")

summary = await agent(
    prompt=(
        f"Berikut adalah hasil audit paralel dari 3 Sub-Agent untuk `{project_slug}`:\n"
        f"{json.dumps(reviews, indent=2, ensure_ascii=False)}\n\n"
        "Perbarui bagian '1. Catatan Evaluasi Output Terakhir' di dalam file `hub/BRAINSTORM.md` "
        "dengan merangkum hasil evaluasi 3 Sub-Agent ini secara rapi (pertahankan bagian Backlog Ide Topik di bawahnya). "
        "Kembalikan ringkasan singkat hasil sintesis."
    ),
    schema={"type": "string"},
    role="Lead Hub Synthesizer"
)

log(f"Sintesis selesai: {summary}")
print(json.dumps({"project": project_slug, "parallel_reviews": reviews, "summary": summary}, indent=2, ensure_ascii=False))
