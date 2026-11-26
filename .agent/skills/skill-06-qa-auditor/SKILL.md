---
name: skill-06-qa-auditor
description: >-
  Core Skill 06 (QA Gate sebelum Render): Membaca active_project.json dan
  memeriksa 02_script.json, 03_audio_timestamps.json, 04_storyboard.json, serta
  theme_config.json di projects/<activeProject>/ untuk memastikan kepatuhan Safe
  Zone Reels (X: 80-920, Y: 140-1500), visual beat sat-set (<= 150 frames /
  2.5s), transisi 12-15 frames, phrase-aware semantic chunking, dan sinkronisasi
  frame VO akurat. Menghasilkan projects/<activeProject>/qa_report.md.
---

# Skill 06: QA & Safe-Zone Auditor (`skill-06-qa-auditor`)

## Peran & Tujuan
Gerbang kualitas otomatis (**Quality Assurance Gate**) yang wajib dijalankan sebelum merender video `.mp4`. Dieksekusi melalui `python scripts/qa_auditor.py` (otomatis membaca proyek aktif dari `active_project.json` atau argumen `--project`).

## Kontrak Data
- **Konfigurasi Proyek Aktif:** `active_project.json`
- **Input (`projects/<activeProject>/`):**
  - `project.meta.json`
  - `02_script.json`
  - `03_audio_timestamps.json`
  - `04_storyboard.json`
  - `theme_config.json`
- **Output:** `projects/<activeProject>/qa_report.md` (dan disinkronkan ke `workspace/current_project/qa_report.md`)

## Checklist Audit Otomatis (Standar v2)
1. **Reels Safe Zone (`X: 80..920`, `Y: 140..1500`):** Memastikan koordinat `(x, y)` seluruh elemen visual & `<WordSyncCaption />` aman dari UI Reels.
2. **Sat-Set Pacing & Visual Beat Rule (`<= 2.5 Detik / 150 Frames`):** Memastikan `transitionDurationFrames` berada di `12..15 frames` dan jeda antar-beat visual di setiap scene `<= 150 frames` (`2.5s`).
3. **Phrase-Aware Semantic Chunking Audit:** Memastikan `captionChunks` di `03_audio_timestamps.json` berisi `2–5 kata` per grup dan tidak ada chunk yang berakhir dengan preposisi/kata sambung gantung (`ke`, `di`, `dari`, `pada`, `untuk`, `yang`, `dan`).
4. **Audio-Visual Frame Sync:** Memastikan `totalDurationFrames` di `04_storyboard.json` sinkron 100% dengan `03_audio_timestamps.json` dan file `vo_master.mp3` tersedia di `projects/<activeProject>/media/vo_master.mp3` serta `public/`.
