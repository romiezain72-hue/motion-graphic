# 🗂️ CHAT REGISTRY — Buku Induk 4 Tab Chat Tetap (`motion-graphic`)

- **Terakhir Diperbarui:** `2026-11-25 23:11 WIB`
- **Arsitektur Pilihan (Best Practice):** **4 Permanent Role Chats** (`automation`, `brainstorming`, `prompt-generator`, `motion-graph`).

> **Prinsip Kepemilikan (1 Chat = 1 File `.md`):**
> Keempat tab chat yang ada di sidebar proyek `motion-graphic` sudah **diikat langsung (1-on-1 binding)** dengan ke-4 file Markdown di folder `hub/`. Kamu tidak perlu membuat chat baru setiap ganti project video — cukup gunakan ke-4 tab chat ini terus-menerus!

---

## 1. Tabel Ikatan Resmi 4 Tab Chat Sidebar $\leftrightarrow$ 4 File `hub/*.md`

<!-- AUTO_REGISTRY_TABLE_START -->
| Nama Chat di Sidebar | Chat ID & Link Langsung | File `.md` yang DIMILIKI (Writer) | File `.md` yang DIBACA (Reader) | Peran Saklek |
| :--- | :--- | :--- | :--- | :--- |
| **`automation`** | [`f82744d1`](conversation://f82744d1-ec7c-45de-907d-c65cf04cc4c1) | [hub/AUTOMATION.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/AUTOMATION.md) | Semua `hub/*.md` | **Bengkel Mesin & Baseline:** Upgrade rules, skills, hooks, scripts Python, workflows, & komponen Remotion. |
| **`brainstorming`** | [`4d37ca91`](conversation://4d37ca91-a788-40a3-8945-1f9fe7ef49d1) | [hub/BRAINSTORM.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/BRAINSTORM.md) | [hub/RESULT.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/RESULT.md) | **Otak Kreatif & Evaluasi:** Riset ide topik video, susun konsep/hook, & evaluasi hasil render dari `RESULT.md`. |
| **`prompt-generator`** | [`1e1439ad`](conversation://1e1439ad-b079-499d-805b-a5b175eaca4e) | [hub/PROMPT_QUEUE.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/PROMPT_QUEUE.md) | [hub/BRAINSTORM.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/BRAINSTORM.md) & [hub/RESULT.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/RESULT.md) | **Arsitek Instruksi Teknis:** Mengubah ide di `BRAINSTORM.md` menjadi spesifikasi prompt siap eksekusi di `PROMPT_QUEUE.md` (`STATUS: READY`). |
| **`motion-graph`** | [`00b62ab0`](conversation://00b62ab0-503a-4922-b415-063f37dc2bac) | [hub/RESULT.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/RESULT.md) | [hub/PROMPT_QUEUE.md](file:///c:/Users/LENOVO/Documents/ai-playground/motion-graphic/hub/PROMPT_QUEUE.md) | **Eksekutor Produksi & Render:** Mengeksekusi `PROMPT_QUEUE.md` via 6 Core Skills & `build_reel.py`, lalu melapor ke `RESULT.md`. |
<!-- AUTO_REGISTRY_TABLE_END -->
