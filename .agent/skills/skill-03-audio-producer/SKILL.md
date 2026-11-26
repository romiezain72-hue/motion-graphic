---
name: skill-03-audio-producer
description: >-
  Core Skill 03 (Audio-First Timing & Semantic Caption Aligner): Membaca
  active_project.json, menjalankan scripts/tts_engine.py (Edge-TTS WordBoundary +
  FFmpeg Broadcast Vocal Polish / Acoustic Pause Tightening + ElevenLabs Pro
  Adapter) untuk memproduksi media/vo_master.mp3 dan mengekstrak word-level
  timestamps & phrase-aware captionChunks presisi frame 60fps ke dalam
  projects/<activeProject>/03_audio_timestamps.json.
---

# Skill 03: Audio Producer & Timestamp Extractor (`skill-03-audio-producer`)

## Peran & Tujuan
Menerapkan prinsip **Audio-First Timing** dengan kualitas suara yang mengalir (*smooth*) dan bebas *drift*:
1. Mengekstrak *word-level timestamps* presisi (`boundary="WordBoundary"` di `edge-tts`, `/with-timestamps` di ElevenLabs API jika `ELEVENLABS_API_KEY` terisi di `.env`, serta kalibrasi akustik `ffmpeg silencedetect` terhadap jeda napas sebenarnya).
2. Memoles audio VO dengan **FFmpeg Broadcast Vocal Mastering** (pemangkasan jeda mati `>280ms` agar bicara mengalir luwes, *warm low-mid presence EQ*, *de-essing*, dan *dynamic compression*).
3. Menyusun **`captionChunks`** berbasis **Phrase-Aware / Semantic Chunking** (3–5 kata utuh per klausa, tanpa memotong frasa seperti *"menukik ke depan"*).

## Kontrak Data (JSON Data Contract)
- **Konfigurasi Proyek Aktif:** `active_project.json` (atau argumen CLI `--project 002_drone-pitch-physics`)
- **Input:** `projects/<activeProject>/02_script.json`
- **Command:** `python scripts/tts_engine.py` (atau `python scripts/tts_engine.py --project 002_drone-pitch-physics`)
- **Output:**
  - `projects/<activeProject>/media/vo_master.mp3`
  - `public/projects/<activeProject>/media/vo_master.mp3` & `public/audio/vo_master.mp3`
  - `projects/<activeProject>/03_audio_timestamps.json` (dan disinkronkan ke `workspace/current_project/03_audio_timestamps.json`)
