"""
Auto-Chain Pipeline Orchestrator (`workflows/auto_chain_pipeline.py`)
---------------------------------------------------------------------
Menjalankan estafet otomatis tanpa pindah tab chat setelah `hub/BRAINSTORM.md` dikunci:

- Stage 1 (Prompt Generator Agent):
  Membaca `hub/BRAINSTORM.md`, `hub/STYLE_LAB.md`, dan `.agent/skills/skill-04-visual-director/SKILL.md`,
  lalu menyusun spesifikasi produksi teknis lengkap ke dalam `hub/PROMPT_QUEUE.md` (`STATUS: READY`).

- Stage 2 (Motion-Graph Executor Agent):
  Membaca `hub/PROMPT_QUEUE.md`, menginisialisasi proyek baru via `scripts/build_reel.py --init`,
  menulis `01_brief.json`, `02_script.json`, `04_storyboard.json`, `theme_config.json`,
  menjalankan `python scripts/build_reel.py --with-tts --render <full|preview>`,
  memastikan QA Gate & TypeScript Gate PASS, mengubah `hub/PROMPT_QUEUE.md` menjadi `STATUS: DONE`,
  dan menulis laporan akhir lengkap ke `hub/RESULT.md`.

Argumen (`Args` pada `run_workflow`):
  - `render_mode`: `"full"` (default), `"preview"` (render 3 detik pertama / 180 frames), atau `"none"`
  - `stage`: `"all"` (default: Stage 1 + Stage 2) atau `"execute_only"` (hanya Stage 2 jika PROMPT_QUEUE.md sudah READY)
"""

import json

wf_args = args if "args" in dir() and isinstance(args, dict) else {}
render_mode = wf_args.get("render_mode", "full")
run_stage = wf_args.get("stage", "all")

log(f"Memulai Auto-Chain Pipeline (stage={run_stage}, render_mode={render_mode})")

if run_stage in ("all", "prompt_only"):
    phase("Stage 1: Auto-Trigger Prompt Generator (hub/BRAINSTORM.md -> hub/PROMPT_QUEUE.md)")
    prompt_gen_result = await agent(
        prompt=(
            "Kamu adalah Agent `prompt-generator` dalam mode Auto-Chain.\n"
            "Tugasmu:\n"
            "1. Baca `hub/BRAINSTORM.md` untuk melihat konsep proyek yang baru saja dikunci oleh user.\n"
            "2. Baca `.agent/skills/skill-04-visual-director/SKILL.md` dan `hub/STYLE_LAB.md` agar kamu memanfaatkan "
            "21 komponen modular terbaru (seperti `AnimatedConnectorLine`, `AnimatedDataChart`, `SplitComparisonCard`, "
            "`KineticTextBlock`, `LiveCodeTerminal`, `RadialGaugeCallout`, `TimelineSlider`, `BoundingBoxFrame`, "
            "`FloatingStickerCard`, `Scene3DObject` 5-mode) serta 5 variasi `cameraMotion.type` (`fast_punch_zoom`, "
            "`zoom_out_reveal`, `lateral_whip_pan`, `micro_turbulence`, `counter_tilt_lock`).\n"
            "3. Tulis spesifikasi instruksi produksi yang 100% lengkap dan siap eksekusi ke dalam `hub/PROMPT_QUEUE.md` "
            "dengan baris status di atas `- **STATUS:** `READY``.\n"
            "   Pastikan di dalam `hub/PROMPT_QUEUE.md` sudah tertulis lengkap:\n"
            "   - Perintah `python scripts/build_reel.py --init <NNN_slug> --title \"<Judul>\" --archetype <A|B|C>`\n"
            "   - JSON lengkap untuk `01_brief.json`\n"
            "   - JSON lengkap untuk `02_script.json` (pastikan `semanticChunks` 2-4 kata utuh secara klausa, bebas kata depan menggantung, dan 100% cocok kata-per-kata dengan `voText`)\n"
            "   - JSON lengkap untuk `04_storyboard.json` (gunakan variasi kamera antar-scene, koordinat di dalam Safe Zone X:80-920 Y:140-1500, transisi 14 frames, dan visualBeatFrames rapat <= 90 frames)\n"
            "   - JSON lengkap untuk `theme_config.json`\n"
            f"   - Perintah eksekusi akhir: `python scripts/build_reel.py --project <NNN_slug> --with-tts --render {render_mode} --version-tag v1`\n"
            "Kembalikan ringkasan slug proyek dan konfirmasi bahwa `hub/PROMPT_QUEUE.md` sudah `STATUS: READY`."
        ),
        schema={
            "type": "object",
            "properties": {
                "project_slug": {"type": "string"},
                "archetype": {"type": "string"},
                "queue_status": {"type": "string"},
                "summary": {"type": "string"}
            },
            "required": ["project_slug", "queue_status", "summary"]
        },
        role="Stage 1: Prompt Generator (Auto-Chain)"
    )
    log(f"[Stage 1 Selesai] Project: {prompt_gen_result['project_slug']} | Status Queue: {prompt_gen_result['queue_status']}")

if run_stage in ("all", "execute_only"):
    phase(f"Stage 2: Auto-Trigger Motion-Graph Executor (hub/PROMPT_QUEUE.md -> Build & Render [{render_mode}] -> hub/RESULT.md)")
    exec_result = await agent(
        prompt=(
            "Kamu adalah Agent `motion-graph` (Mesin Eksekutor Produksi & Render) dalam mode Auto-Chain.\n"
            "Tugasmu:\n"
            "1. Baca seluruh isi instruksi di `hub/PROMPT_QUEUE.md`.\n"
            "2. Jalankan perintah inisialisasi proyek baru: `python scripts/build_reel.py --init <slug> --title \"<Judul>\" --archetype <A|B|C>`.\n"
            "3. Tulis file `01_brief.json`, `02_script.json`, `04_storyboard.json`, dan `theme_config.json` di dalam folder `projects/<slug>/` sesuai spesifikasi di `hub/PROMPT_QUEUE.md`.\n"
            f"4. Jalankan One-Gate Pipeline Runner: `python scripts/build_reel.py --project <slug> --with-tts --render {render_mode} --version-tag v1`.\n"
            "   - Catatan: `.env` sudah terkonfigurasi dengan `ELEVENLABS_API_KEY` (`TTS_PROVIDER=elevenlabs`), sehingga `--with-tts` akan otomatis menghasilkan suara ElevenLabs Pro + word timestamps.\n"
            "   - Jika `qa_auditor.py` atau `npx tsc --noEmit` menemukan pelanggaran/error, perbaiki file JSON/kode tersebut dan jalankan ulang `build_reel.py` sampai 100% PASS.\n"
            "5. Setelah seluruh gerbang & render selesai:\n"
            "   - Ubah status di bagian atas `hub/PROMPT_QUEUE.md` menjadi `- **STATUS:** `DONE``.\n"
            "   - Perbarui `active_project.json` (`checkpointStage: \"v1_rendered\"`).\n"
            "   - Tulis laporan hasil produksi lengkap ke `hub/RESULT.md` (berisi slug proyek, durasi frame/detik, provider VO yang terpakai, komponen visual yang digunakan, status QA/TypeScript, dan path file `.mp4` hasil render).\n"
            "Kembalikan laporan ringkas hasil eksekusi."
        ),
        schema={
            "type": "object",
            "properties": {
                "project_slug": {"type": "string"},
                "qa_status": {"type": "string"},
                "render_output_path": {"type": "string"},
                "duration_seconds": {"type": "number"},
                "summary": {"type": "string"}
            },
            "required": ["project_slug", "qa_status", "render_output_path", "summary"]
        },
        role="Stage 2: Motion-Graph Executor (Auto-Chain)"
    )
    log(f"[Stage 2 Selesai] Project: {exec_result['project_slug']} | QA: {exec_result['qa_status']} | Output: {exec_result['render_output_path']}")
    print(json.dumps(exec_result, indent=2, ensure_ascii=False))
