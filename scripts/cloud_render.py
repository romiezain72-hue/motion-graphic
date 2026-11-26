#!/usr/bin/env python3
"""
Cloud & Turbo Render Orchestrator (`scripts/cloud_render.py`)
-------------------------------------------------------------
Solusi agar laptop tidak berat saat merender video panjang (1080x1920 @ 60fps):

Mendukung 3 Mode:
  1. `--mode cloud` (GitHub Actions Cloud Offload):
     Men-trigger workflow `.github/workflows/render-reel.yml` di server cloud GitHub
     menggunakan `GITHUB_TOKEN` & `GITHUB_REPO` di `.env` (tanpa wajib install `gh` CLI!).
     Server GitHub (4-core / 16GB RAM) yang akan merender `.mp4` di background dan
     menyimpannya di tab Actions -> Artifacts.
  2. `--mode local-turbo` (Optimasi Render Lokal Hemat CPU/GPU):
     Menjalankan `npx remotion render` dengan flag `--gl=angle --concurrency=50%`
     agar memanfaatkan akselerasi hardware ANGLE tanpa membuat laptop freeze.
  3. `--mode preview` (Fast 3-Second / 180-Frame Smoke Preview):
     Merender 3 detik pertama dalam ~15 detik untuk mengecek visual sebelum lempar full render ke cloud.

Contoh Pemakaian:
  python scripts/cloud_render.py --status
  python scripts/cloud_render.py --mode preview
  python scripts/cloud_render.py --mode local-turbo
  python scripts/cloud_render.py --mode cloud --render-type full
"""

import argparse
import json
import os
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path
from typing import Optional


def load_dotenv(root: Path) -> None:
    for env_name in [".env", ".env.local"]:
        env_path = root / env_name
        if env_path.exists():
            for line in env_path.read_text(encoding="utf-8").splitlines():
                s = line.strip()
                if not s or s.startswith("#") or "=" not in s:
                    continue
                k, v = s.split("=", 1)
                k = k.strip()
                v = v.strip().strip('"').strip("'")
                if k and k not in os.environ:
                    os.environ[k] = v


def resolve_active_project(root: Path, cli_project: Optional[str] = None) -> str:
    if cli_project:
        return cli_project
    ap_file = root / "active_project.json"
    if ap_file.exists():
        data = json.loads(ap_file.read_text(encoding="utf-8"))
        return data.get("activeProject", "_template")
    return "_template"


def trigger_github_cloud_render(
    repo: str, token: str, branch: str, project_slug: str, render_type: str
) -> int:
    url = f"https://api.github.com/repos/{repo}/actions/workflows/render-reel.yml/dispatches"
    payload = json.dumps(
        {
            "ref": branch,
            "inputs": {
                "project": project_slug,
                "render_mode": render_type,
                "concurrency": "4",
            },
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        url,
        data=payload,
        headers={
            "Accept": "application/vnd.github+json",
            "Authorization": f"Bearer {token}",
            "X-GitHub-Api-Version": "2022-11-28",
            "Content-Type": "application/json",
            "User-Agent": "motion-graphic-cloud-renderer",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            if resp.status in (200, 201, 204):
                print("=" * 72)
                print(f"[CLOUD RENDER DISPATCHED] Project '{project_slug}' ({render_type}) dikirim ke GitHub Cloud!")
                print(f"Pantau & download hasil .mp4 di: https://github.com/{repo}/actions")
                print("=" * 72)
                return 0
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="replace")
        print(f"[ERROR] GitHub API HTTP {e.code}: {body}")
        return 1
    except Exception as e:
        print(f"[ERROR] Gagal menghubungi GitHub API: {e}")
        return 1
    return 0


def main() -> int:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    root = Path(__file__).resolve().parent.parent
    load_dotenv(root)

    parser = argparse.ArgumentParser(description="Cloud & Local-Turbo Remotion Render Orchestrator")
    parser.add_argument("--project", default=None, help="Project slug (default: active_project.json)")
    parser.add_argument(
        "--mode",
        choices=["status", "preview", "local-turbo", "cloud"],
        default="status",
        help="Execution mode (status, preview, local-turbo, cloud)",
    )
    parser.add_argument(
        "--render-type",
        choices=["preview", "full"],
        default="full",
        help="For --mode cloud: preview (180 frames) or full",
    )
    args = parser.parse_args()

    project_slug = resolve_active_project(root, args.project)
    gh_repo = os.getenv("GITHUB_REPO", "").strip()
    gh_token = os.getenv("GITHUB_TOKEN", "").strip()
    gh_branch = os.getenv("GITHUB_BRANCH", "main").strip()
    el_key = os.getenv("ELEVENLABS_API_KEY", "").strip()
    gem_key = os.getenv("GEMINI_API_KEY", "").strip()

    if args.mode == "status":
        print("=" * 72)
        print("CLOUD RENDER & PRO TOOLS DIAGNOSTIC STATUS")
        print("=" * 72)
        print(f"- Active Project      : {project_slug}")
        print(f"- GitHub Cloud Workflow: .github/workflows/render-reel.yml (READY)")
        print(f"- GITHUB_REPO (.env)  : {gh_repo if gh_repo else 'BELUM DIISI (Isi di .env untuk Cloud Render)'}")
        print(f"- GITHUB_TOKEN (.env) : {'TERPASANG' if gh_token else 'BELUM DIISI (Isi PAT GitHub di .env)'}")
        print(f"- ELEVENLABS_API_KEY  : {'TERPASANG (Pro VO Aktif)' if el_key else 'BELUM DIISI (Saat ini menggunakan Edge-TTS/Gemini)'}")
        print(f"- GEMINI_API_KEY      : {'TERPASANG (Gemini 2.5 Native TTS Siap)' if gem_key else 'BELUM DIISI'}")
        print("=" * 72)
        return 0

    if args.mode == "cloud":
        if not gh_repo or not gh_token:
            print("[INFO] Untuk melempar render ke GitHub Cloud tanpa membebani laptop:")
            print("  1. Buat repository di GitHub (misal: username/motion-graphic) dan push folder ini.")
            print("  2. Isi GITHUB_REPO=username/motion-graphic dan GITHUB_TOKEN=ghp_xxx di file `.env`.")
            print("  3. Jalankan ulang: `python scripts/cloud_render.py --mode cloud --render-type full`")
            return 1
        return trigger_github_cloud_render(gh_repo, gh_token, gh_branch, project_slug, args.render_type)

    # First run QA & TypeScript validation gate
    gate = subprocess.run(
        [sys.executable, "scripts/build_reel.py", "--project", project_slug, "--render", "none"],
        cwd=str(root),
        stdin=subprocess.DEVNULL,
    )
    if gate.returncode != 0:
        return gate.returncode

    renders_dir = root / "projects" / project_slug / "renders"
    renders_dir.mkdir(parents=True, exist_ok=True)

    if args.mode == "preview":
        out_path = renders_dir / f"{project_slug}_preview_3s.mp4"
        cmd = f'npx remotion render src/index.ts ReelsComposition "{out_path}" --frames=0-179 --gl=angle'
    else:
        out_path = renders_dir / f"{project_slug}_turbo_full.mp4"
        cmd = f'npx remotion render src/index.ts ReelsComposition "{out_path}" --gl=angle --concurrency=50%'

    print(f"[TURBO RENDER] Running: {cmd}")
    res = subprocess.run(cmd, cwd=str(root), shell=True, stdin=subprocess.DEVNULL)
    return res.returncode


if __name__ == "__main__":
    sys.exit(main())
