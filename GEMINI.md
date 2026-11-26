# Project Workspace Rules (`motion-graphic`)

Dokumen `GEMINI.md` ini adalah **Master Rule (Always-On)** yang otomatis dibaca pada **SETIAP turn** oleh **ke-4 Tab Chat Tetap (Permanent Role Chats)** di dalam workspace `C:\Users\LENOVO\Documents\ai-playground\motion-graphic`.

---

## Rule 1: `four-pillar-role-ownership` (4 Tab Chat Tetap & Kepemilikan Mutlak File `hub/*.md`)

Proyek ini menggunakan pola **4 Tab Chat Saklek Berbasis Peran (4 Permanent Role Chats)**. Setiap chat memiliki **1 file `.md` milik sendiri (Single Writer)** di folder `hub/` dan membaca file milik chat lain sesuai alur berikut:

| Nama Tab Chat di Sidebar | Conversation ID | File yang DIMILIKI (Wajib Di-update oleh Chat Ini) | File yang DIBACA (Input Utama) | Tugas & Peran Saklek |
| :--- | :--- | :--- | :--- | :--- |
| **1. `automation`** | `f82744d1-ec7c-45de-907d-c65cf04cc4c1` | **`hub/AUTOMATION.md`**, **`hub/CHAT_REGISTRY.md`**, **`hub/STYLE_LAB.md`** | Semua file `hub/*.md` | **Bengkel Mesin & Arsitektur Baseline:** Mengelola `GEMINI.md`, `.agent/skills/`, `.agent/hooks.json`, `scripts/`, `workflows/`, dan komponen engine `src/`. |
| **2. `brainstorming`** | `4d37ca91-a788-40a3-8945-1f9fe7ef49d1` | **`hub/BRAINSTORM.md`** | **`hub/RESULT.md`**, **`hub/STYLE_LAB.md`**, & `active_project.json` | **Otak Kreatif, Riset & Evaluasi:** Mencari ide topik paradoks, membedah retensi/visual, mengevaluasi hasil di `RESULT.md`, menulis konsep matang ke `hub/BRAINSTORM.md`, dan memunculkan **Pop-Up Auto-Chain (`ask_question`)**. |
| **3. `prompt-generator`** | `1e1439ad-b079-499d-805b-a5b175eaca4e` | **`hub/PROMPT_QUEUE.md`** | **`hub/BRAINSTORM.md`**, **`hub/STYLE_LAB.md`**, & **`hub/RESULT.md`** | **Penerjemah Spesifikasi Teknis:** Mengubah hasil diskusi di `hub/BRAINSTORM.md` menjadi instruksi teknis siap eksekusi di `hub/PROMPT_QUEUE.md` (dan menyetel `STATUS: READY`). |
| **4. `motion-graph`** | `00b62ab0-503a-4922-b415-063f37dc2bac` | **`hub/RESULT.md`** | **`hub/PROMPT_QUEUE.md`** & `active_project.json` | **Mesin Eksekutor Produksi & Render:** Mengeksekusi `hub/PROMPT_QUEUE.md` menggunakan 6 Core Skills & `scripts/build_reel.py`, merender video, mengubah `PROMPT_QUEUE.md` menjadi `STATUS: DONE`, dan wajib menulis laporan ke `hub/RESULT.md`. |

---

## Rule 2: `auto-chain-popup-trigger` (WAJIB: Pop-Up Pilihan Full Otomatis vs Manual Per-Section)

Untuk mencegah user harus bolak-balik memberi instruksi manual dari `brainstorming` $\rightarrow$ `prompt-generator` $\rightarrow$ `motion-graph`, **PATUHI MEKANISME POP-UP OTOMATIS BERIKUT**:

### A. Saat Berada di Tab `brainstorming` (`4d37ca91`):
1. Setiap kali user **memilih/menyetujui topik** (misal: *"Pilih topik A/B/C"*, *"Gas topik 2"*, atau *"Lock konsep ini"*) dan kamu selesai menuliskan konsep lengkapnya ke dalam **`hub/BRAINSTORM.md`**, kamu **WAJIB LANGSUNG memanggil tool `ask_question`** pada turn yang sama untuk memunculkan **Pop-Up Pilihan Mode Eksekusi** kepada user:
   - **`question`**: `"Konsep sudah dikunci di hub/BRAINSTORM.md! Mau dilanjut dengan mode eksekusi apa?"`
   - **`options`**:
     1. `"(Recommended) Full Otomatis — Langsung jalankan Prompt Generator + Motion-Graph (VO ElevenLabs + Render Full .mp4)"`
     2. `"Otomatis Preview 3 Detik — Jalankan Prompt Generator + Motion-Graph (VO ElevenLabs + Render Preview 180 frames)"`
     3. `"Manual Per-Section — Berhenti di BRAINSTORM.md (Saya akan instruksikan manual ke tiap tab chat)"`
2. **Tindakan Berdasarkan Pilihan Pop-Up User:**
   - **Jika user memilih `Full Otomatis`**:
     Langsung panggil tool `run_workflow`:
     ```python
     run_workflow(
       ScriptPath="c:/Users/LENOVO/Documents/ai-playground/motion-graphic/workflows/auto_chain_pipeline.py",
       Description="Auto-Chain Full Pipeline: Prompt Generator -> Motion-Graph Full Render",
       Args={"render_mode": "full", "stage": "all"}
     )
     ```
   - **Jika user memilih `Otomatis Preview 3 Detik`**:
     Langsung panggil tool `run_workflow`:
     ```python
     run_workflow(
       ScriptPath="c:/Users/LENOVO/Documents/ai-playground/motion-graphic/workflows/auto_chain_pipeline.py",
       Description="Auto-Chain Preview Pipeline: Prompt Generator -> Motion-Graph 3s Preview Render",
       Args={"render_mode": "preview", "stage": "all"}
     )
     ```
   - **Jika user memilih `Manual Per-Section`**:
     Konfirmasi bahwa `hub/BRAINSTORM.md` sudah siap dan user dapat pindah ke tab `prompt-generator`.

### B. Saat Berada di Tab `prompt-generator` (`1e1439ad` — Jika User Memakai Mode Manual):
1. Setelah selesai menulis spesifikasi ke `hub/PROMPT_QUEUE.md` (`STATUS: READY`), panggil tool `ask_question` dengan opsi:
   - `"(Recommended) Otomatis Eksekusi Motion-Graph Sekarang (Full Render .mp4)"` -> jalankan `run_workflow` pada `workflows/auto_chain_pipeline.py` dengan `Args={"render_mode": "full", "stage": "execute_only"}`.
   - `"Otomatis Eksekusi Motion-Graph (Preview 3 Detik)"` -> jalankan `run_workflow` pada `workflows/auto_chain_pipeline.py` dengan `Args={"render_mode": "preview", "stage": "execute_only"}`.
   - `"Manual — Saya akan pindah sendiri ke tab motion-graph"`.

---

## Rule 3: `pipeline-and-checkpoint-contract` (Standar Produksi 6 Core Skills, 21 Komponen & ElevenLabs VO)

Saat mengerjakan produksi atau revisi video di `projects/<activeProject>/` (ditentukan oleh `active_project.json`):
1. Gunakan **`python scripts/build_reel.py --init <NNN_slug> --title "<Judul>" --archetype A|B|C`** saat membuat proyek baru pertama kali.
2. Gunakan **6 Core Skills** di `.agent/skills/` dan **21 Komponen Modular** (lihat katalog lengkap di `.agent/skills/skill-04-visual-director/SKILL.md` dan `hub/STYLE_LAB.md`):
   - `skill-01-content-strategist` -> `01_brief.json`
   - `skill-02-script-architect` -> `02_script.json` (wajib menyertakan `semanticChunks` 2–4 kata utuh secara klausa)
   - `skill-03-audio-producer` -> `python scripts/tts_engine.py` (otomatis menggunakan **ElevenLabs Pro** dari `.env`) -> `03_audio_timestamps.json` + `media/vo_master.mp3`
   - `skill-04-visual-director` -> `04_storyboard.json` (wajib variasikan `cameraMotion.type` antar-scene: `fast_punch_zoom`, `zoom_out_reveal`, `lateral_whip_pan`, `micro_turbulence`, `counter_tilt_lock`; transisi `14 frames`; visual beat `<= 120 frames`; Safe Zone `X: 80–920, Y: 140–1500`)
   - `skill-05-motion-style-engine` -> `theme_config.json` & `src/motionCurves.ts`
   - `skill-06-qa-auditor` -> `python scripts/qa_auditor.py` -> `qa_report.md` (wajib **PASS** sebelum render)
3. Gunakan **One-Gate CLI Runner (`python scripts/build_reel.py --with-tts --render none|preview|full`)** lalu perbarui `hub/RESULT.md`.
