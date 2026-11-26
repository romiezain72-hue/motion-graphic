# Project Workspace Rules (`motion-graphic`)

Dokumen `GEMINI.md` ini adalah **Master Rule (Always-On)** yang otomatis dibaca pada **SETIAP turn** oleh **ke-4 Tab Chat Tetap (Permanent Role Chats)** di dalam workspace `C:\Users\LENOVO\Documents\ai-playground\motion-graphic`.

---

## Rule 1: `four-pillar-role-ownership` (4 Tab Chat Tetap & Kepemilikan Mutlak File `hub/*.md`)

Proyek ini menggunakan pola **4 Tab Chat Saklek Berbasis Peran (4 Permanent Role Chats)**. Setiap chat memiliki **1 file `.md` milik sendiri (Single Writer)** di folder `hub/` dan membaca file milik chat lain sesuai alur berikut:

| Nama Tab Chat di Sidebar | Conversation ID | File yang DIMILIKI (Wajib Di-update oleh Chat Ini) | File yang DIBACA (Input Utama) | Tugas & Peran Saklek |
| :--- | :--- | :--- | :--- | :--- |
| **1. `automation`** | `f82744d1-ec7c-45de-907d-c65cf04cc4c1` | **`hub/AUTOMATION.md`** & **`hub/CHAT_REGISTRY.md`** | Semua file `hub/*.md` | **Bengkel Mesin & Arsitektur Baseline:** Mengelola `GEMINI.md`, `.agent/skills/`, `.agent/hooks.json`, `scripts/`, `workflows/`, dan komponen engine `src/`. |
| **2. `brainstorming`** | `4d37ca91-a788-40a3-8945-1f9fe7ef49d1` | **`hub/BRAINSTORM.md`** | **`hub/RESULT.md`** & `active_project.json` | **Otak Kreatif, Riset & Evaluasi:** Mencari ide topik paradoks, membedah retensi/visual, mengevaluasi hasil di `RESULT.md`, dan menulis konsep matang ke `hub/BRAINSTORM.md`. |
| **3. `prompt-generator`** | `1e1439ad-b079-499d-805b-a5b175eaca4e` | **`hub/PROMPT_QUEUE.md`** | **`hub/BRAINSTORM.md`** & **`hub/RESULT.md`** | **Penerjemah Spesifikasi Teknis:** Mengubah hasil diskusi di `hub/BRAINSTORM.md` menjadi instruksi teknis siap eksekusi di `hub/PROMPT_QUEUE.md` (dan menyetel `STATUS: READY`). |
| **4. `motion-graph`** | `00b62ab0-503a-4922-b415-063f37dc2bac` | **`hub/RESULT.md`** | **`hub/PROMPT_QUEUE.md`** & `active_project.json` | **Mesin Eksekutor Produksi & Render:** Mengeksekusi `hub/PROMPT_QUEUE.md` menggunakan 6 Core Skills & `scripts/build_reel.py`, merender video, mengubah `PROMPT_QUEUE.md` menjadi `STATUS: DONE`, dan wajib menulis laporan ke `hub/RESULT.md`. |

### Aturan Ketat Kepemilikan File (*Strict Single-Writer Rule*):
1. **Dilarang Menulis Silang:**
   - Chat `brainstorming` **HANYA** menulis ke `hub/BRAINSTORM.md` (jangan pernah menulis ke `RESULT.md` atau `AUTOMATION.md`).
   - Chat `prompt-generator` **HANYA** menulis ke `hub/PROMPT_QUEUE.md`.
   - Chat `motion-graph` **HANYA** menulis laporan ke `hub/RESULT.md` (dan mengubah baris `STATUS:` di `PROMPT_QUEUE.md` menjadi `DONE`).
   - Chat `automation` **HANYA** mengurus `hub/AUTOMATION.md`, `hub/CHAT_REGISTRY.md`, serta kode mesin/otomasi.
2. **Otomatisasi Tanpa Copy-Paste:**
   - Saat user berbicara di chat `brainstorming`, otomatis baca `hub/RESULT.md` dan `hub/BRAINSTORM.md`, lalu simpan hasil diskusi ke `hub/BRAINSTORM.md` tanpa perlu disuruh.
   - Saat user berbicara di chat `prompt-generator`, otomatis baca `hub/BRAINSTORM.md` dan `hub/RESULT.md`, lalu tulis prompt eksekusi ke `hub/PROMPT_QUEUE.md` (`STATUS: READY`).
   - Saat user berbicara di chat `motion-graph` (misal: *"Eksekusi"* atau *"Jalankan prompt"*), otomatis baca `hub/PROMPT_QUEUE.md`, jalankan pipeline hingga tuntas, lalu perbarui `hub/RESULT.md`.
3. **Jika Ada Chat ke-5 (Ad-Hoc / Eksperimen Tambahan di Luar 4 Chat Inti):**
   - Hook `SessionStart` (`scripts/hook_session_context.py`) otomatis membuatkan file terpisah di `hub/chats/chat_<shortId>.md` agar tidak mengotori 4 file inti di atas.

---

## Rule 2: `pipeline-and-checkpoint-contract` (Standar Produksi 6 Core Skills & One-Gate CLI)

Saat chat `motion-graph` mengerjakan produksi atau revisi video di `projects/<activeProject>/` (ditentukan oleh `active_project.json`):
1. Gunakan **`python scripts/build_reel.py --init <NNN_slug> --title "<Judul>" --archetype A|B|C`** saat membuat proyek baru pertama kali.
2. Gunakan **6 Core Skills** di `.agent/skills/` secara modular:
   - `skill-01-content-strategist` -> `01_brief.json`
   - `skill-02-script-architect` -> `02_script.json` (wajib menyertakan `semanticChunks` 2–5 kata utuh secara klausa)
   - `skill-03-audio-producer` -> `python scripts/tts_engine.py` -> `03_audio_timestamps.json` + `media/vo_master.mp3`
   - `skill-04-visual-director` -> `04_storyboard.json` (transisi `12–15 frames`, visual beat `<= 150 frames` / `2.5s`, Safe Zone `X: 80–920, Y: 140–1500`)
   - `skill-05-motion-style-engine` -> `theme_config.json` & `src/projectLoader.ts`
   - `skill-06-qa-auditor` -> `python scripts/qa_auditor.py` -> `qa_report.md` (wajib **PASS** sebelum render)
3. Gunakan **One-Gate CLI Runner (`python scripts/build_reel.py`)** untuk menyinkronkan durasi frame storyboard, menjalankan QA Gate, TypeScript Check, dan Render (`--render none|preview|full`), lalu perbarui `hub/RESULT.md`.
