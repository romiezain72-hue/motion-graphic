#!/usr/bin/env python3
"""
One-Gate Deterministic Pipeline Runner & Project Initializer (`scripts/build_reel.py`)
--------------------------------------------------------------------------------------
Fitur Utama:
  0. [Auto-Init Proyek Baru: `--init <slug>`]
     Contoh: `python scripts/build_reel.py --init 001_judul-topik --title "Judul Topik" --archetype A|B|C`
     - Menyalin `projects/_template/` ke `projects/<slug>/`
     - Mengatur `project.meta.json` dan `theme_config.json` sesuai Archetype pilihan
     - Mengubah saklar `active_project.json` ke `<slug>`
     - Meng-generate ulang `src/projectLoader.ts` secara otomatis agar TypeScript/Remotion langsung terhubung!
  1. [Auto-Sync `src/projectLoader.ts`] Setiap kali dijalankan, memastikan seluruh folder proyek di `projects/`
     terdaftar di `src/projectLoader.ts`.
  2. [Opsional: `--with-tts`] Menjalankan `scripts/tts_engine.py` untuk memproduksi `vo_master.mp3` & `03_audio_timestamps.json`.
  3. [Auto-Sync Frame Contract] Menyinkronkan `durationFrames` per-scene di `04_storyboard.json` dengan `03_audio_timestamps.json`.
  4. [QA Gate] Menjalankan `scripts/qa_auditor.py`.
  5. [TypeScript Gate] Menjalankan `npx tsc --noEmit`.
  6. [Opsional: `--render none|preview|full`] Merender `.mp4` jika diminta.
"""

import argparse
import datetime
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any, Dict, Optional

ARCHETYPE_PRESETS: Dict[str, Dict[str, Any]] = {
    "A": {
        "activeArchetype": "archetype_a_editorial_2d",
        "paletteName": "oceanic_science_nature",
        "backdropPreset": "ocean_abyss_strata",
        "colors": {
            "bgPrimary": "#0B2538",
            "bgSecondary": "#16425B",
            "surfaceAccent": "#7A8B56",
            "surfaceCard": "#133147",
            "textPrimary": "#F8FAFC",
            "textSecondary": "#CBD5E1",
            "accentHighlight": "#38BDF8",
            "accentSecondary": "#FACC15",
            "accentBadge": "#FACC15",
            "accentBadgeText": "#0F172A",
            "extrudeShadow": "#05131E",
        },
    },
    "B": {
        "activeArchetype": "archetype_b_dark_engineering_ui",
        "paletteName": "obsidian_crimson_cyan_telemetry",
        "backdropPreset": "dark_engineering_grid",
        "colors": {
            "bgPrimary": "#09090B",
            "bgSecondary": "#12131A",
            "surfaceAccent": "#1E293B",
            "surfaceCard": "#14151C",
            "textPrimary": "#F8FAFC",
            "textSecondary": "#94A3B8",
            "accentHighlight": "#EF4444",
            "accentSecondary": "#38BDF8",
            "accentBadge": "#FACC15",
            "accentBadgeText": "#09090B",
            "extrudeShadow": "#030305",
        },
    },
    "C": {
        "activeArchetype": "archetype_c_blueprint_canvas",
        "paletteName": "cobalt_blueprint_highlighter",
        "backdropPreset": "cobalt_blueprint",
        "colors": {
            "bgPrimary": "#1D4ED8",
            "bgSecondary": "#1E3A8A",
            "surfaceAccent": "#3B82F6",
            "surfaceCard": "#0F172A",
            "textPrimary": "#FFFFFF",
            "textSecondary": "#DBEAFE",
            "accentHighlight": "#FACC15",
            "accentSecondary": "#38BDF8",
            "accentBadge": "#FACC15",
            "accentBadgeText": "#0F172A",
            "extrudeShadow": "#0B1536",
        },
    },
}


def resolve_active_project(root: Path, cli_project: Optional[str] = None) -> str:
    if cli_project:
        return cli_project
    ap_file = root / "active_project.json"
    if ap_file.exists():
        data = json.loads(ap_file.read_text(encoding="utf-8"))
        return data.get("activeProject", "_template")
    return "_template"


def regenerate_project_loader(root: Path, default_slug: str) -> None:
    """Scans projects/* and writes src/projectLoader.ts automatically."""
    projects_dir = root / "projects"
    valid_slugs: list[str] = []
    for d in sorted(projects_dir.iterdir()):
        if d.is_dir() and (d / "03_audio_timestamps.json").exists() and (d / "04_storyboard.json").exists() and (d / "theme_config.json").exists():
            valid_slugs.append(d.name)

    if not valid_slugs:
        valid_slugs = ["_template"]

    fallback_slug = default_slug if default_slug in valid_slugs else valid_slugs[-1]

    import_lines: list[str] = []
    registry_entries: list[str] = []

    for slug in valid_slugs:
        var_prefix = "p_" + re.sub(r"[^a-zA-Z0-9_]", "_", slug)
        import_lines.append(f'import {var_prefix}_Audio from "../projects/{slug}/03_audio_timestamps.json";')
        import_lines.append(f'import {var_prefix}_Storyboard from "../projects/{slug}/04_storyboard.json";')
        import_lines.append(f'import {var_prefix}_Theme from "../projects/{slug}/theme_config.json";')
        registry_entries.append(
            f'  "{slug}": {{\n'
            f"    audioTimestamps: {var_prefix}_Audio,\n"
            f"    storyboard: {var_prefix}_Storyboard,\n"
            f"    themeConfig: {var_prefix}_Theme,\n"
            f"  }},"
        )

    loader_code = (
        "/**\n"
        " * Multi-Project Dynamic Loader (`src/projectLoader.ts`)\n"
        " * Auto-generated & synchronized by `scripts/build_reel.py`.\n"
        " * Reads `active_project.json` at the root of the workspace and resolves the active\n"
        " * project's JSON contracts (`03_audio_timestamps.json`, `04_storyboard.json`, `theme_config.json`).\n"
        " */\n"
        'import activeProjectConfig from "../active_project.json";\n\n'
        + "\n".join(import_lines)
        + "\n\nconst PROJECT_REGISTRY = {\n"
        + "\n".join(registry_entries)
        + "\n} as const;\n\n"
        "export type ProjectSlug = keyof typeof PROJECT_REGISTRY;\n\n"
        "export const activeProjectSlug: ProjectSlug =\n"
        "  activeProjectConfig.activeProject in PROJECT_REGISTRY\n"
        "    ? (activeProjectConfig.activeProject as ProjectSlug)\n"
        f'    : "{fallback_slug}";\n\n'
        "const activeBundle = PROJECT_REGISTRY[activeProjectSlug];\n\n"
        "export const audioTimestamps = activeBundle.audioTimestamps;\n"
        "export const storyboard = activeBundle.storyboard;\n"
        "export const themeConfig = activeBundle.themeConfig;\n"
    )
    (root / "src" / "projectLoader.ts").write_text(loader_code, encoding="utf-8")


def init_new_project(root: Path, slug: str, title: str, archetype_key: str) -> None:
    template_dir = root / "projects" / "_template"
    target_dir = root / "projects" / slug
    now_iso = datetime.datetime.now().astimezone().isoformat(timespec="seconds")

    preset = ARCHETYPE_PRESETS.get(archetype_key.upper(), ARCHETYPE_PRESETS["B"])

    if not target_dir.exists():
        shutil.copytree(template_dir, target_dir)
    (target_dir / "media").mkdir(parents=True, exist_ok=True)
    (target_dir / "renders").mkdir(parents=True, exist_ok=True)

    # Update project.meta.json
    proj_id = slug.split("_", 1)[0] if "_" in slug else "001"
    meta = {
        "id": proj_id,
        "slug": slug,
        "title": title or slug,
        "format": "standard_reels_30s",
        "archetype": preset["activeArchetype"],
        "status": "initialized",
        "version": "v1",
        "createdAt": now_iso,
        "updatedAt": now_iso,
        "checkpoints": {
            "01_brief": "pending",
            "02_script": "pending",
            "03_audio": "pending",
            "04_storyboard": "pending",
            "05_theme": "ready",
            "06_qa": "pending",
        },
    }
    (target_dir / "project.meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Update projectId inside 01..04 JSON files
    for fname in ["01_brief.json", "02_script.json", "03_audio_timestamps.json", "04_storyboard.json"]:
        fpath = target_dir / fname
        if fpath.exists():
            data = json.loads(fpath.read_text(encoding="utf-8"))
            data["projectId"] = slug
            if fname == "01_brief.json" and title:
                data["topic"] = title
            if fname == "04_storyboard.json":
                for sc in data.get("scenes", []):
                    sc["backdropPreset"] = preset["backdropPreset"]
            fpath.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Update theme_config.json
    theme_path = target_dir / "theme_config.json"
    if theme_path.exists():
        theme_data = json.loads(theme_path.read_text(encoding="utf-8"))
        theme_data["activeArchetype"] = preset["activeArchetype"]
        theme_data["paletteName"] = preset["paletteName"]
        theme_data["colors"] = preset["colors"]
        theme_path.write_text(json.dumps(theme_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Switch active_project.json to the new project
    ap_data = {
        "activeProject": slug,
        "projectsRoot": "projects",
        "globalAssetsRoot": "assets/global",
        "checkpointStage": "01_brief_pending",
        "updatedAt": now_iso,
    }
    (root / "active_project.json").write_text(json.dumps(ap_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    # Regenerate src/projectLoader.ts
    regenerate_project_loader(root, slug)
    print(f"[INIT] Project '{slug}' initialized (Archetype: {preset['activeArchetype']}) and set as activeProject!")


def sync_storyboard_with_audio_timestamps(proj_dir: Path) -> Dict[str, Any]:
    ts_path = proj_dir / "03_audio_timestamps.json"
    sb_path = proj_dir / "04_storyboard.json"

    audio_ts = json.loads(ts_path.read_text(encoding="utf-8"))
    storyboard = json.loads(sb_path.read_text(encoding="utf-8"))

    timings_by_id = {
        t["sceneId"]: t for t in audio_ts.get("sceneTimings", [])
    }

    updated_scenes = 0
    for scene in storyboard.get("scenes", []):
        sid = scene["sceneId"]
        if sid in timings_by_id:
            target_dur = int(timings_by_id[sid]["durationFrames"])
            if scene.get("durationFrames") != target_dur:
                scene["durationFrames"] = target_dur
                updated_scenes += 1

            if "visualBeatFrames" in scene:
                beats = [b for b in scene["visualBeatFrames"] if b < target_dur - 15]
                if not beats or (target_dur - beats[-1]) > 145:
                    cursor = beats[-1] if beats else 0
                    while cursor + 115 < target_dur - 15:
                        cursor += 115
                        beats.append(cursor)
                scene["visualBeatFrames"] = beats

            for el in scene.get("elements", []):
                props = el.get("props", {})
                if "openLoopAtRelativeFrame" in props:
                    props["openLoopAtRelativeFrame"] = max(
                        120, target_dur - 190
                    )

    total_frames = sum(int(s.get("durationFrames", 0)) for s in storyboard.get("scenes", []))
    storyboard["totalDurationFrames"] = total_frames
    sb_path.write_text(json.dumps(storyboard, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    return {
        "totalFrames": total_frames,
        "totalSeconds": round(total_frames / 60.0, 2),
        "updatedScenes": updated_scenes,
        "semanticChunks": len(audio_ts.get("captionChunks", [])),
    }


def run_step(label: str, cmd: list[str], cwd: Path, use_shell: bool = False) -> bool:
    print(f"[RUN] [{label}] {' '.join(cmd)}")
    res = subprocess.run(
        cmd if not use_shell else " ".join(cmd),
        cwd=str(cwd),
        shell=use_shell,
        stdin=subprocess.DEVNULL,
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
    )
    if res.stdout and res.stdout.strip():
        print(f"  {res.stdout.strip()}")
    if res.returncode != 0:
        print(f"[FAIL] [{label}] (Exit Code {res.returncode}):")
        if res.stderr and res.stderr.strip():
            print(res.stderr.strip())
        return False
    print(f"[PASS] [{label}]")
    return True


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    parser = argparse.ArgumentParser(description="One-Gate Deterministic Reel Pipeline Runner & Project Initializer")
    parser.add_argument("--init", default=None, help="Initialize a brand-new project slug (e.g. 001_topik-baru)")
    parser.add_argument("--title", default="", help="Human-readable topic/title when using --init")
    parser.add_argument("--archetype", choices=["A", "B", "C", "a", "b", "c"], default="B", help="Visual archetype when using --init (A, B, or C)")
    parser.add_argument("--project", default=None, help="Project slug (defaults to active_project.json)")
    parser.add_argument("--with-tts", action="store_true", help="Re-run tts_engine.py before syncing & auditing")
    parser.add_argument(
        "--render",
        choices=["none", "preview", "full"],
        default="none",
        help="Render mode after QA & TypeScript gates pass (default: none)",
    )
    parser.add_argument("--version-tag", default="v1", help="Version suffix for full render filename")
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent

    if args.init:
        init_new_project(root, args.init, args.title, args.archetype)
        if not args.with_tts and args.render == "none":
            return run_step("TypeScript Compile Gate", ["npx", "tsc", "--noEmit"], root, use_shell=True) and 0 or 1

    project_slug = resolve_active_project(root, args.project or args.init)
    proj_dir = root / "projects" / project_slug

    if not proj_dir.exists():
        print(f"[ERROR] Project directory not found: {proj_dir}")
        return 1

    # Always keep src/projectLoader.ts synced with projects/
    regenerate_project_loader(root, project_slug)

    print("=" * 72)
    print(f"MOTION-GRAPHIC ONE-GATE PIPELINE | Active Project: {project_slug}")
    print("=" * 72)

    if args.with_tts:
        if not run_step("1. TTS Audio Producer", [sys.executable, "scripts/tts_engine.py", "--project", project_slug], root):
            return 1
    else:
        print("[SKIP] [1. TTS Audio Producer] Using existing 03_audio_timestamps.json (pass --with-tts to regenerate)")

    sync_info = sync_storyboard_with_audio_timestamps(proj_dir)
    print(
        f"[PASS] [2. Auto-Sync Storyboard Frames] {sync_info['totalFrames']} frames "
        f"({sync_info['totalSeconds']}s @ 60fps), {sync_info['semanticChunks']} semantic chunks "
        f"({sync_info['updatedScenes']} scene durations adjusted)"
    )

    if not run_step("3. QA & Safe-Zone Gate", [sys.executable, "scripts/qa_auditor.py", "--project", project_slug], root):
        print("[BLOCKED] PIPELINE BLOCKED BY QA GATE: Fix errors in qa_report.md before rendering.")
        return 1

    if not run_step("4. TypeScript Compile Gate", ["npx", "tsc", "--noEmit"], root, use_shell=True):
        print("[BLOCKED] PIPELINE BLOCKED BY TYPESCRIPT GATE: Fix type errors before rendering.")
        return 1

    render_output_note = "Validation only (--render none)"
    if args.render in ("preview", "full"):
        renders_dir = proj_dir / "renders"
        renders_dir.mkdir(parents=True, exist_ok=True)
        if args.render == "preview":
            out_file = renders_dir / f"{project_slug}_preview_3s.mp4"
            render_cmd = [
                "npx",
                "remotion",
                "render",
                "src/index.ts",
                "ReelsComposition",
                str(out_file),
                "--frames=0-179",
            ]
        else:
            out_file = renders_dir / f"{project_slug}_{args.version_tag}.mp4"
            render_cmd = [
                "npx",
                "remotion",
                "render",
                "src/index.ts",
                "ReelsComposition",
                str(out_file),
            ]

        if not run_step(f"5. Remotion Render ({args.render})", render_cmd, root, use_shell=True):
            return 1
        size_mb = round(out_file.stat().st_size / (1024 * 1024), 2) if out_file.exists() else 0
        render_output_note = f"projects/{project_slug}/renders/{out_file.name} ({size_mb} MB)"
    else:
        print("[SKIP] [5. Remotion Render] Skipped (--render none). Pass --render preview or --render full to export .mp4.")

    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S WIB")
    print("=" * 72)
    print(f"[SUCCESS] ALL GATES PASSED ({now_str}) | Output: {render_output_note}")
    print("=" * 72)
    return 0


if __name__ == "__main__":
    sys.exit(main())
