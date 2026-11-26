#!/usr/bin/env python3
"""
Antigravity Lifecycle Hook: SessionStart Context & Role Resolver (`scripts/hook_session_context.py`)
----------------------------------------------------------------------------------------------------
Mengenali 4 Permanent Role Chats di sidebar:
  - f82744d1 -> `automation` (Pemilik: hub/AUTOMATION.md)
  - 4d37ca91 -> `brainstorming` (Pemilik: hub/BRAINSTORM.md)
  - 1e1439ad -> `prompt-generator` (Pemilik: hub/PROMPT_QUEUE.md)
  - 00b62ab0 -> `motion-graph` (Pemilik: hub/RESULT.md)
Jika ada chat ke-5 di luar 4 chat inti, otomatis dibuatkan kamar terpisah di `hub/chats/chat_<id>.md`.
"""

import datetime
import json
import os
import sys
import threading
from pathlib import Path
from typing import Any, Dict, Optional

CORE_ROLE_CHATS: Dict[str, Dict[str, str]] = {
    "f82744d1": {
        "name": "automation",
        "owns": "hub/AUTOMATION.md",
        "reads": "hub/RESULT.md, hub/BRAINSTORM.md, hub/PROMPT_QUEUE.md",
        "role": "Bengkel Mesin & Arsitektur Baseline",
    },
    "4d37ca91": {
        "name": "brainstorming",
        "owns": "hub/BRAINSTORM.md",
        "reads": "hub/RESULT.md",
        "role": "Otak Kreatif, Riset Topik & Evaluasi Hasil",
    },
    "1e1439ad": {
        "name": "prompt-generator",
        "owns": "hub/PROMPT_QUEUE.md",
        "reads": "hub/BRAINSTORM.md & hub/RESULT.md",
        "role": "Arsitek Spesifikasi Prompt Siap Eksekusi",
    },
    "00b62ab0": {
        "name": "motion-graph",
        "owns": "hub/RESULT.md",
        "reads": "hub/PROMPT_QUEUE.md",
        "role": "Eksekutor Teknis 6 Core Skills, build_reel.py & Remotion Render",
    },
}


def find_workspace_root() -> Path:
    here = Path(__file__).resolve().parent
    if (here.parent / "active_project.json").exists():
        return here.parent
    cwd = Path.cwd()
    if (cwd / "active_project.json").exists():
        return cwd
    if (cwd.parent / "active_project.json").exists():
        return cwd.parent
    return here.parent


def read_stdin_payload_nonblocking(timeout_sec: float = 0.08) -> Dict[str, Any]:
    holder: Dict[str, Any] = {}

    def _reader() -> None:
        try:
            raw = sys.stdin.readline()
            if raw and raw.strip():
                holder["data"] = json.loads(raw.strip())
        except Exception:
            pass

    t = threading.Thread(target=_reader, daemon=True)
    t.start()
    t.join(timeout=timeout_sec)
    return holder.get("data", {})


def resolve_chat_identity(root: Path, conv_id: Optional[str]) -> str:
    if not conv_id or len(conv_id) < 8:
        return "Role: CLI / Unknown"

    short_id = conv_id[:8]
    if short_id in CORE_ROLE_CHATS:
        info = CORE_ROLE_CHATS[short_id]
        return (
            f"Kamu adalah Tab Chat Tetap `{info['name']}` (`{short_id}`) — {info['role']}. "
            f"File yang KAMU MILIKI (Wajib Kamu Tulis/Update): `{info['owns']}`. "
            f"File Input yang Kamu Baca: `{info['reads']}`."
        )

    # Extra 5th+ ad-hoc chat fallback -> hub/chats/chat_<short_id>.md
    hub_dir = root / "hub"
    chats_dir = hub_dir / "chats"
    chats_dir.mkdir(parents=True, exist_ok=True)
    chat_note_path = chats_dir / f"chat_{short_id}.md"
    now_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")

    if not chat_note_path.exists():
        note_content = (
            f"# 💬 Catatan Kamar Pribadi — Chat Tambahan `{short_id}`\n\n"
            f"- **Conversation ID:** `{conv_id}` ([Buka Percakapan](conversation://{conv_id}))\n"
            f"- **Waktu Dibuat:** `{now_str} WIB`\n"
        )
        chat_note_path.write_text(note_content, encoding="utf-8")

    return (
        f"Kamu adalah Chat Tambahan `{short_id}` (di luar 4 chat inti). "
        f"Simpan catatanmu di `hub/chats/chat_{short_id}.md` agar tidak menimpa 4 file inti di `hub/`."
    )


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

    root = find_workspace_root()
    payload = read_stdin_payload_nonblocking(timeout_sec=0.08)
    conv_id = payload.get("conversationId") or os.environ.get("ANTIGRAVITY_CONVERSATION_ID")

    identity_msg = resolve_chat_identity(root, conv_id)

    active_slug = "_template"
    checkpoint_stage = "ready_for_new_project"
    ap_path = root / "active_project.json"
    if ap_path.exists():
        try:
            ap_data = json.loads(ap_path.read_text(encoding="utf-8"))
            active_slug = ap_data.get("activeProject", active_slug)
            checkpoint_stage = ap_data.get("checkpointStage", checkpoint_stage)
        except Exception:
            pass

    queue_status = "IDLE"
    pq_path = root / "hub" / "PROMPT_QUEUE.md"
    if pq_path.exists():
        try:
            for line in pq_path.read_text(encoding="utf-8").splitlines():
                if "STATUS:" in line:
                    queue_status = line.split("STATUS:", 1)[1].strip()
                    break
        except Exception:
            pass

    msg = (
        f"[AUTO-HOOK motion-graphic] {identity_msg} | "
        f"Active Project: `{active_slug}` | Stage: `{checkpoint_stage}` | "
        f"Prompt Queue: `{queue_status}`."
    )

    output = {
        "injectSteps": [
            {
                "systemMessage": {
                    "systemMessage": msg
                }
            }
        ]
    }
    sys.stdout.write(json.dumps(output, ensure_ascii=False))
    sys.stdout.flush()


if __name__ == "__main__":
    main()
