---
name: skill-02-script-architect
description: >-
  Core Skill 02: Membaca active_project.json dan projects/<activeProject>/01_brief.json,
  menyusun naskah produksi per-scene dengan hook 3 detik tajam, open loop tiap
  15-20 detik, payoff kuat, tanda baca ramah TTS, serta mendefinisikan
  semanticChunks (3-5 kata utuh secara klausa/makna) ke dalam
  projects/<activeProject>/02_script.json.
---

# Skill 02: Script Architect (`skill-02-script-architect`)

## Peran & Tujuan
Membaca `projects/<activeProject>/01_brief.json` (dari `active_project.json`) dan menyusun naskah produksi per-scene (`02_script.json`) dengan struktur retensi tinggi, aliran bicara TTS yang natural (*smooth*), serta pemenggalan **`semanticChunks`** agar caption tidak pernah memotong frasa di tengah kesatuan makna.

## Kontrak Data (JSON Data Contract)
- **Konfigurasi Proyek Aktif:** `active_project.json`
- **Input:** `projects/<activeProject>/01_brief.json`
- **Output:** `projects/<activeProject>/02_script.json` (dan disinkronkan ke `workspace/current_project/02_script.json`)

## Aturan Ketat Penulisan Naskah & Semantic Chunking
1. **Struktur Retensi Per-Scene:**
   - **Hook 3 Detik Pertama (`scene_01_hook`):** Kalimat pertama langsung menghantam klaim paradoks utama.
   - **Open Loop / Pattern Interrupt (`tiap 15–20 detik`):** Kalimat terakhir di setiap scene menjadi jembatan rasa penasaran menuju scene berikutnya.
   - **Strong Payoff (`scene_06_gimbal_twist`):** Menjawab paradoks utama dengan fakta rekayasa paling mengejutkan (`-35°` bodi vs `+35°` gimbal pada `1.000 Hz`).
2. **Aliran Bicara VO (`voText`) yang Smooth:**
   - Gunakan kalimat Bahasa Indonesia lisan yang luwes, aktif, dan mengalir (gunakan koma `,` secara strategis hanya pada jeda napas alami klausa, hindari titik terlalu rapat yang membuat TTS berhenti kaku).
   - Jangan gunakan simbol matematika mentah (`±`, `>`, `/`, `°`). Tuliskan `"derajat"` atau `"persen"` dalam kata utuh.
3. **Phrase-Aware / Semantic Chunking (`semanticChunks`):**
   - Setiap scene **WAJIB** menyertakan array `semanticChunks`: daftar frasa pendek berisi **2–5 kata** yang utuh secara tata bahasa dan makna (contoh benar: `["badannya selalu", "menunduk miring ke depan,", "bukan terbang datar?"]`; contoh DILARANG: memisahkan `"menukik"` dan `"ke depan"` di chunk berbeda).
   - Kata depan/preposisi (`di`, `ke`, `dari`, `pada`, `untuk`, `dengan`, `yang`, `dan`, `atau`) **DILARANG KERAS** diletakkan menggantung di akhir sebuah chunk.
4. **`highlightWords`**: Tandai 4–8 kata kunci berdampak tinggi per scene untuk diberi efek *scale pop* dan warna aksen pada `<WordSyncCaption />`.
