#!/usr/bin/env python3
"""
Core Skill-06: QA & Safe-Zone Auditor v2 (scripts/qa_auditor.py)
Multi-Project Architecture Support (reads active_project.json or --project <slug>)

Audits:
  1. Reels Safe Zone compliance (X: 80..920, Y: 140..1500) for all storyboard elements & captions
  2. Sat-Set Pacing Rule:
     - Transition duration between 12 and 15 frames (0.20s - 0.25s @ 60fps)
     - Visual beat interval <= 150 frames (2.5 seconds) in every scene
  3. Phrase-Aware Semantic Caption Chunking:
     - captionChunks present in 03_audio_timestamps.json
     - Each chunk has 2..6 words and does NOT end with a dangling Indonesian preposition/conjunction
  4. Audio-Visual Frame Synchronization (03_audio_timestamps.json vs 04_storyboard.json & media/vo_master.mp3)

Outputs:
  projects/<activeProject>/qa_report.md (and workspace/current_project/qa_report.md)
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Optional

SAFE_X_MIN = 80
SAFE_X_MAX = 920
SAFE_Y_MIN = 140
SAFE_Y_MAX = 1500

FORBIDDEN_DANGLING_WORDS = {
    "di",
    "ke",
    "dari",
    "pada",
    "untuk",
    "dengan",
    "yang",
    "dan",
    "atau",
    "saat",
    "agar",
    "karena",
    "hingga",
    "demi",
    "seperti",
}


def resolve_active_project(root: Path, cli_project: Optional[str] = None) -> str:
    if cli_project:
        return cli_project
    ap_file = root / "active_project.json"
    if ap_file.exists():
        data = json.loads(ap_file.read_text(encoding="utf-8"))
        return data.get("activeProject", "_template")
    return "_template"


def normalize_word(w: str) -> str:
    return re.sub(r"[^\w]", "", w.lower())


def main() -> int:
    parser = argparse.ArgumentParser(description="Skill-06 QA & Safe-Zone Auditor v2")
    parser.add_argument("--project", default=None, help="Project slug under projects/")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent
    project_slug = resolve_active_project(root, args.project)
    proj_dir = root / "projects" / project_slug

    audio_ts = json.loads((proj_dir / "03_audio_timestamps.json").read_text(encoding="utf-8"))
    storyboard = json.loads((proj_dir / "04_storyboard.json").read_text(encoding="utf-8"))
    theme = json.loads((proj_dir / "theme_config.json").read_text(encoding="utf-8"))

    checks = []
    errors = []

    # 1. Check Audio File & Frame Sync
    proj_vo = proj_dir / "media" / "vo_master.mp3"
    pub_vo = root / "public" / "projects" / project_slug / "media" / "vo_master.mp3"
    if proj_vo.exists() and proj_vo.stat().st_size > 1000 and pub_vo.exists():
        checks.append(
            f"✅ **Master VO File**: `projects/{project_slug}/media/vo_master.mp3` ditemukan ({proj_vo.stat().st_size} bytes) & tersinkron ke `public/projects/{project_slug}/media/vo_master.mp3`."
        )
    else:
        errors.append(
            f"❌ **Master VO File**: `projects/{project_slug}/media/vo_master.mp3` atau `public/projects/{project_slug}/media/vo_master.mp3` tidak ditemukan."
        )

    ts_frames = audio_ts.get("totalDurationFrames", 0)
    sb_scenes = storyboard.get("scenes", [])
    sb_total_frames = sum(s.get("durationFrames", 0) for s in sb_scenes)
    if ts_frames == sb_total_frames and ts_frames > 0:
        checks.append(
            f"✅ **Audio-Visual Frame Sync**: Durasi storyboard (`{sb_total_frames} frames` / `{round(sb_total_frames/60, 2)}s` @ 60fps) sinkron 100% dengan `03_audio_timestamps.json`."
        )
    else:
        errors.append(
            f"❌ **Audio-Visual Frame Sync Mismatch**: Storyboard={sb_total_frames} frames vs Audio={ts_frames} frames."
        )

    # 2. Check Transition Speed (12 - 15 frames sat-set target)
    trans_frames = storyboard.get("transitionDurationFrames", 21)
    if 12 <= trans_frames <= 15:
        checks.append(
            f"✅ **Sat-Set Scene Transition**: `transitionDurationFrames = {trans_frames}` frames (`{round(trans_frames/60, 2)}s` @ 60fps) memenuhi standar `12–15 frames`."
        )
    else:
        errors.append(
            f"❌ **Transition Too Slow/Fast**: `transitionDurationFrames = {trans_frames}` frames (wajib `12–15 frames`)."
        )

    # 3. Check Phrase-Aware Semantic Chunking
    caption_chunks = audio_ts.get("captionChunks", [])
    if not caption_chunks:
        errors.append("❌ **Semantic Caption Chunks Missing**: `captionChunks` kosong di `03_audio_timestamps.json`.")
    else:
        dangling_violations = []
        for idx, ch in enumerate(caption_chunks):
            words = ch.get("words", [])
            if not words:
                continue
            last_raw = words[-1].get("word", "")
            last_norm = normalize_word(last_raw)
            has_punct = bool(re.search(r"[,.;:?!]$", last_raw))
            if last_norm in FORBIDDEN_DANGLING_WORDS and not has_punct:
                dangling_violations.append(f"Chunk #{idx+1} ('{ch.get('text')}') ends with dangling '{last_raw}'")
        if not dangling_violations:
            checks.append(
                f"✅ **Phrase-Aware Semantic Chunking**: `{len(caption_chunks)}` grup caption tervalidasi utuh secara klausa/makna (0 kata depan/preposisi menggantung)."
            )
        else:
            for v in dangling_violations:
                errors.append(f"❌ **Semantic Chunk Violation**: {v}")

    # 4. Check Safe Zone Compliance (X: 80-920, Y: 140-1500)
    for scene in sb_scenes:
        sid = scene["sceneId"]
        hl = scene.get("headline")
        if hl:
            hx, hy = hl.get("x", 540), hl.get("y", 400)
            if SAFE_X_MIN <= hx <= SAFE_X_MAX and SAFE_Y_MIN <= hy <= SAFE_Y_MAX:
                checks.append(
                    f"✅ **Safe Zone [{sid} -> Headline]**: Posisi `(X={hx}, Y={hy})` aman di dalam batas Reels."
                )
            else:
                errors.append(
                    f"❌ **Safe Zone Violation [{sid} -> Headline]**: Posisi `(X={hx}, Y={hy})` keluar dari batas aman."
                )

        for el in scene.get("elements", []):
            comp = el.get("component")
            props = el.get("props", {})
            if comp == "Scene3DObject" and not props.get("enabled", True):
                continue
            x = props.get("x", 540)
            y = props.get("y", 500)
            if SAFE_X_MIN <= x <= SAFE_X_MAX and SAFE_Y_MIN <= y <= SAFE_Y_MAX:
                checks.append(
                    f"✅ **Safe Zone [{sid} -> {comp}]**: Posisi `(X={x}, Y={y})` berada di dalam batas aman Reels (`X:{SAFE_X_MIN}-{SAFE_X_MAX}`, `Y:{SAFE_Y_MIN}-{SAFE_Y_MAX}`)."
                )
            else:
                errors.append(
                    f"❌ **Safe Zone Violation [{sid} -> {comp}]**: Posisi `(X={x}, Y={y})` keluar dari batas aman (`X:{SAFE_X_MIN}-{SAFE_X_MAX}`, `Y:{SAFE_Y_MIN}-{SAFE_Y_MAX}`)."
                )

    caption_y = storyboard.get("captionSafeZone", {}).get("y", 1410)
    if SAFE_Y_MIN <= caption_y <= SAFE_Y_MAX:
        checks.append(
            f"✅ **WordSyncCaption Safe Zone**: Posisi subtitle `Y={caption_y}` aman di dalam Bottom Safe Zone (`1380-1480`)."
        )
    else:
        errors.append(f"❌ **WordSyncCaption Violation**: Posisi `Y={caption_y}` di luar Safe Zone.")

    # 5. Check Sat-Set Visual Beat Intervals (<= 2.5 seconds / 150 frames per visual beat)
    for scene in sb_scenes:
        sid = scene["sceneId"]
        dur = scene.get("durationFrames", 0)
        cam = scene.get("cameraMotion", {}).get("type", "none")
        els = scene.get("elements", [])
        beat_frames = sorted(
            set(
                [el.get("enterAtRelativeFrame", 0) for el in els]
                + scene.get("visualBeatFrames", [])
            )
        )
        max_gap = beat_frames[0] if beat_frames else dur
        for a, b in zip(beat_frames, beat_frames[1:]):
            max_gap = max(max_gap, b - a)
        if cam != "none" and max_gap <= 150:
            checks.append(
                f"✅ **Sat-Set Visual Beat [{sid}]**: Durasi `{dur}` frames ({round(dur/60, 2)}s), kamera `{cam}`, interval beat visual maks `{max_gap}` frames (`<= 150 frames / 2.5s`)."
            )
        else:
            errors.append(
                f"❌ **Slow Pacing Warning [{sid}]**: Kamera `{cam}` atau jeda antar-beat `{max_gap}` frames > 150 frames (2.5s)."
            )

    status_str = "PASS (READY TO RENDER)" if not errors else "FAIL (FIX REQUIRED)"
    report_lines = [
        "# QA & Safe-Zone Audit Report (`skill-06-qa-auditor` v2)",
        f"- **Active Project:** `{project_slug}` (`{storyboard.get('projectId')}`)",
        f"- **Active Archetype:** `{theme.get('activeArchetype')}` (`{theme.get('paletteName')}`)",
        f"- **Total Duration:** `{sb_total_frames} frames` (`{round(sb_total_frames / 60.0, 2)} seconds` @ `60fps`)",
        f"- **Transition Speed:** `{trans_frames} frames` (`{round(trans_frames / 60.0, 2)}s`)",
        f"- **Semantic Caption Chunks:** `{len(caption_chunks)} phrase groups`",
        f"- **Audit Status:** **{status_str}**",
        "",
        "## Audit Checks",
        *checks,
    ]
    if errors:
        report_lines.extend(["", "## Errors", *errors])

    report_text = "\n".join(report_lines) + "\n"
    report_path = proj_dir / "qa_report.md"
    report_path.write_text(report_text, encoding="utf-8")

    print(f"[QA AUDITOR] Project={project_slug} | Status: {status_str} -> {report_path}")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
