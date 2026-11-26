"""
End-to-End Multi-Agent Reel Production Orchestrator (`workflows/produce_reel_workflow.py`)
------------------------------------------------------------------------------------------
Blueprint Orchestrator untuk memproduksi video baru atau menjalankan Checkpoint Revision
menggunakan 6 Core Skills secara terstruktur (Pipeline + Parallel Sub-Agents).

Cara menjalankan dari chat Antigravity:
- "Jalankan workflow workflows/produce_reel_workflow.py"
"""

import json

with open("active_project.json", "r", encoding="utf-8") as f:
    active_cfg = json.load(f)

project_slug = active_cfg.get("activeProject", "_template")
checkpoint_mode = args.get("mode", "full") if "args" in dir() and isinstance(args, dict) else "full"

log(f"Orchestrator aktif untuk proyek: {project_slug} (Mode: {checkpoint_mode})")

if checkpoint_mode in ("full", "brief"):
    phase("Phase 1: Content Strategist (Skill 01 -> 01_brief.json)")
    brief_res = await agent(
        prompt=(
            f"Baca `.agent/skills/skill-01-content-strategist/SKILL.md` dan `projects/{project_slug}/project.meta.json`. "
            f"Susun atau perbarui `projects/{project_slug}/01_brief.json` dengan Hook 3s tajam, Open Loop tiap 15-20s, dan Payoff kuat."
        ),
        schema={"type": "string"},
        role="01 Content Strategist"
    )
    log(brief_res)

if checkpoint_mode in ("full", "brief", "script"):
    phase("Phase 2: Script Architect & Audio Producer (Skill 02 & 03)")
    script_res = await agent(
        prompt=(
            f"1. Baca `.agent/skills/skill-02-script-architect/SKILL.md` dan `projects/{project_slug}/01_brief.json`.\n"
            f"2. Susun `projects/{project_slug}/02_script.json` lengkap dengan `semanticChunks` (2-5 kata utuh secara klausa).\n"
            f"3. Jalankan `python scripts/tts_engine.py --project {project_slug}` untuk memproduksi `vo_master.mp3` dan `03_audio_timestamps.json`."
        ),
        schema={"type": "string"},
        role="02 & 03 Script + Audio Producer"
    )
    log(script_res)

if checkpoint_mode in ("full", "brief", "script", "visual", "theme"):
    phase("Phase 3: Visual Director & Motion Style Engine (Skill 04 & 05)")
    visual_res = await agent(
        prompt=(
            f"Baca `.agent/skills/skill-04-visual-director/SKILL.md` dan `.agent/skills/skill-05-motion-style-engine/SKILL.md`.\n"
            f"Pastikan `projects/{project_slug}/04_storyboard.json` dan `projects/{project_slug}/theme_config.json` "
            f"sinkron 100% dengan `03_audio_timestamps.json`, memiliki transisi 12-15 frames, dan visual beat <= 150 frames."
        ),
        schema={"type": "string"},
        role="04 & 05 Visual & Motion Director"
    )
    log(visual_res)

phase("Phase 4: QA Gate & Hub Reporting (Skill 06 -> hub/RESULT.md)")
qa_res = await agent(
    prompt=(
        f"1. Jalankan `python scripts/qa_auditor.py --project {project_slug}` dan `npx tsc --noEmit`.\n"
        f"2. Pastikan status di `projects/{project_slug}/qa_report.md` adalah PASS.\n"
        f"3. Perbarui `hub/RESULT.md` dengan status QA terbaru."
    ),
    schema={"type": "string"},
    role="06 QA Gate Auditor"
)
log(qa_res)
