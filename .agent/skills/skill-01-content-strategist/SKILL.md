---
name: skill-01-content-strategist
description: >-
  Core Skill 01 (Gabungan Topic Generator + Idea Brainstorm + Viewer Analyst):
  Membaca active_project.json, menganalisis ide/topik, memetakan persona & pain
  points penonton Reels, merancang hook 3 detik pertama yang tajam, menyusun
  pattern interrupt / open loop setiap 15-20 detik, membangun payoff kuat, dan
  mengekstrak fakta numerik berpotensi visual tinggi ke dalam
  projects/<activeProject>/01_brief.json.
---

# Skill 01: Content Strategist & Retention Analyst (`skill-01-content-strategist`)

## Peran & Tujuan
Menggabungkan riset topik, pembedahan *angle* unik, fakta numerik, dan rekayasa retensi penonton (*3-Second Hook*, *Pattern Interrupt / Open Loop* setiap `15–20 detik`, dan *Strong Payoff / Plot Twist*) ke dalam satu dokumen strategis di **`projects/<activeProject>/01_brief.json`** (berdasarkan `active_project.json` di root).

## Kontrak Data (JSON Data Contract)
- **Konfigurasi Proyek Aktif:** `active_project.json` (`{"activeProject": "NNN_kebab-case-slug"}`)
- **Input:** 1 ide/topik singkat dari user + `projects/<activeProject>/project.meta.json`
- **Output:** `projects/<activeProject>/01_brief.json` (dan disinkronkan ke `workspace/current_project/01_brief.json`)

## Standar Kualitas Storytelling & Retensi (WAJIB)
1. **3-Second Hook Punch (`0.0s – 3.0s`):**
   - Dilarang memakai pembuka bertele-tele atau klise pasif.
   - Langsung hantam dengan **Paradoks Visual**, **Mitos vs Fakta Ekstrem**, atau **Klaim Kontra-Intuitif** di detik pertama.
2. **Pattern Interrupt & Open Loop Setiap `15–20 Detik`:**
   - Setiap scene tidak boleh berhenti secara datar. Di akhir tiap segmen 15–20 detik, wajib ada *Open Loop* (pertanyaan menggantung, ancaman bahaya fisika, atau paradoks baru) yang memaksa penonton bertahan ke step berikutnya.
3. **Strong Payoff / Plot Twist Akhir:**
   - Scene terakhir wajib memberikan *aha-moment* atau *plot twist* teknis/visual yang menjawab paradoks di Hook awal secara memuaskan.

## Skema Output (`01_brief.json`)
```json
{
  "projectId": "002_drone-pitch-physics",
  "topic": "Kenapa drone DJI saat terbang maju posisinya selalu menukik miring ke depan, bukan terbang datar?",
  "selectedAngle": "Bedah Fisika Vektor & Ilusi 3-Axis Gimbal: Tanpa miring (Pitch), drone mustahil maju 1 cm pun karena 4 rotor terkunci vertikal—sementara gimbal 1.000 Hz menyembunyikan kemiringan ekstrem -35° dari mata penonton.",
  "targetAudience": {
    "persona": "Penonton Reels Indonesia (18-38 tahun) penyuka teknologi, gadget/drone, sains terapan, dan engineering explainer cepat",
    "painPoints": [
      "Mengira drone miring saat ngebut karena tertiup angin dari depan",
      "Bingung kenapa video hasil rekaman drone tetap lurus datar padahal bodi drone menukik tajam 35 derajat",
      "Bosan dengan penjelasan fisika yang lambat tanpa visualisasi vektor & telemetri real-time"
    ],
    "retentionTriggers": [
      "0.0s (Hook 3s): Paradoks langsung — video drone terlihat datar, padahal bodinya sedang menukik 35°",
      "16.0s (Open Loop 1): Jebakan 4 rotor vertikal (0° = 0 N dorongan maju) -> lalu gimana cara drone mencuri gaya maju?",
      "34.0s (Open Loop 2): Manuver diferensial RPM (+24% motor belakang) -> tapi begitu miring, kenapa drone nggak jatuh kehilangan daya angkat?",
      "52.0s (Open Loop 3): Pecahan vektor Thrust (T·cosθ vs T·sinθ) & kompensasi gas -> lalu apa yang terjadi saat dihantam badai drag di 75 km/jam?",
      "72.0s (Open Loop 4): Pertarungan Cine 10° vs Normal 25° vs Sport 35° -> kalau bodi nungging 35° ke tanah, kenapa kameranya nggak nyorot aspal?",
      "92.0s (Strong Payoff): Plot Twist 3-Axis Brushless Gimbal 1.000 Hz (-35° bodi vs +35° gimbal = 0.0° horizon lock)"
    ]
  },
  "hookOptions": [],
  "keyFacts": []
}
```
