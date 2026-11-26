# 🎯 PROMPT QUEUE — Antrean Tugas Siap Eksekusi (`motion-graphic`)

- **STATUS:** `DONE`
- **Terakhir Diperbarui:** `2026-11-25 23:34 WIB`
- **Disusun Oleh:** Tab Chat `prompt-generator` (`1e1439ad-b079-499d-805b-a5b175eaca4e`)
- **Sumber Spesifikasi:** `hub/BRAINSTORM.md` & `hub/RESULT.md`
- **Target Proyek (`active_project.json`):** `001_cat-righting-reflex`
- **Judul Proyek:** `"Refleks 0,3 Detik: Fisika Kucing Jatuh Terbalik"`
- **Archetype Visual:** `Archetype C` (`archetype_c_blueprint_canvas` / `cobalt_blueprint_highlighter`)
- **Tipe Eksekusi:** `NEW_PROJECT` (`Full End-to-End 6 Core Skills + One-Gate CLI + Full Render`)

---

## 📋 Ringkasan Misi untuk Tab Chat `motion-graph` (`00b62ab0-503a-4922-b415-063f37dc2bac`)

Bangun dan render proyek video pertama **`001_cat-righting-reflex`** berdurasi **~30 detik (`4 scenes`, `74 kata`, `1080x1920 @ 60fps`)** dengan gaya **Archetype C (*Cobalt Blueprint, Bounding Box & Floating Sticker*)** dari inisialisasi hingga render `.mp4` penuh.

Pastikan 4 kriteria kualitas dari `hub/BRAINSTORM.md` terpenuhi 100%:
1. **Inisialisasi One-Gate CLI:** Gunakan `python scripts/build_reel.py --init 001_cat-righting-reflex --title "Refleks 0,3 Detik: Fisika Kucing Jatuh Terbalik" --archetype C`.
2. **Kinetic Typography + Visual Punchy (Archetype C):** Gunakan preset backdrop `"cobalt_blueprint"`, transisi `14 frames` (`0.23s`), koordinat Safe Zone Reels (`X: 80–920`, `Y: 140–1500`), dan interval *visual beat* rapat (`<= 75 frames`).
3. **Narasi Natural & `semanticChunks` Klausa Utuh (2–4 Kata):** Gunakan `semanticChunks` di bawah yang sudah diverifikasi bebas dari kata depan/konjungsi menggantung (`FORBIDDEN_DANGLING_WORDS` di `qa_auditor.py`) dan 100% identik kata-per-kata dengan `voText`.
4. **Sinkronisasi Audio & Caption Presisi Tinggi:** Jalankan pipeline `scripts/build_reel.py --project 001_cat-righting-reflex --with-tts --render full --version-tag v1`, pastikan `qa_auditor.py` **PASS** dan `npx tsc --noEmit` **PASS**, lalu ubah status file ini menjadi `STATUS: DONE` dan tulis laporan lengkap ke `hub/RESULT.md`.

---

## 🛠️ Langkah 1 — Inisialisasi Proyek Baru (`build_reel.py --init`)

Jalankan perintah inisialisasi berikut di terminal root workspace:

```bash
python scripts/build_reel.py --init 001_cat-righting-reflex --title "Refleks 0,3 Detik: Fisika Kucing Jatuh Terbalik" --archetype C
```

*(Perintah ini otomatis membuat folder `projects/001_cat-righting-reflex/`, menyetel `theme_config.json` ke Archetype C `cobalt_blueprint_highlighter`, mengarahkan `active_project.json` ke `001_cat-righting-reflex`, dan menyinkronkan `src/projectLoader.ts`.)*

---

## 🧠 Langkah 2 — Tulis Kontrak `projects/001_cat-righting-reflex/01_brief.json` (`skill-01-content-strategist`)

Tulis file `projects/001_cat-righting-reflex/01_brief.json` dengan isi eksak berikut:

```json
{
  "projectId": "001_cat-righting-reflex",
  "topic": "Refleks 0,3 Detik: Bagaimana Kucing Jatuh Terbalik Memutar Tubuh 180 Derajat Tanpa Pijakan di Udara",
  "selectedAngle": "Paradoks Kekekalan Momentum Sudut (L = 0): Kucing tidak melanggar hukum fisika, melainkan membagi tubuhnya menjadi 2 poros rotasi berlawanan dengan memanipulasi momen inersia (menekuk vs merentangkan kaki).",
  "targetAudience": {
    "persona": "Penonton Reels Indonesia (18-35 tahun) penyuka sains populer, fisika sehari-hari, dan bedah mekanika visual cepat",
    "painPoints": [
      "Bosan dengan video edukasi yang bertele-tele dan visual kotak statis yang kaku",
      "Sering melihat kucing mendarat dengan kaki tapi belum tahu trik fisika di balik putaran udaranya"
    ],
    "retentionTriggers": [
      "0.0s (Hook 3s): Klaim angka ekstrem 0,3 detik untuk memutar tubuh 180 derajat dari posisi terbalik",
      "7.0s (Open Loop): Paradoks fisika — tanpa pijakan di udara, momentum sudut total wajib nol (L = 0), lalu bagaimana bisa berputar?",
      "14.0s (Mechanism Visual): Mekanisme Bend & Twist 2 poros tulang belakang (kaki depan ditekuk r kecil vs kaki belakang direntang r besar)",
      "23.0s (Payoff): Tukar tekukan kaki depan-belakang untuk mengerem dan mengunci pendaratan sempurna 4 kaki"
    ]
  },
  "hookOptions": [
    {
      "id": "hook_1",
      "formula": "visual_paradox_claim",
      "text": "Jatuhkan kucing dalam posisi terbalik, dan hanya dalam nol koma tiga detik kakinya sudah siap menginjak tanah.",
      "isSelected": true
    }
  ],
  "keyFacts": [
    "0,3 Detik: Waktu rata-rata refleks meluruskan tubuh kucing (Cat Righting Reflex) dari posisi terbalik hingga siap mendarat.",
    "L = 0 (Momentum Sudut Nol): Tanpa tumpuan tolakan di udara, total momentum sudut tubuh kucing harus selalu tetap nol.",
    "2 Poros Berlawanan (+180° vs -30°): Kucing menekuk tubuhnya di tengah sehingga separuh depan dan separuh belakang berputar seperti dua silinder independen.",
    "Manipulasi Inersia (I = m·r²): Kaki yang ditekuk rapat memperkecil radius rotasi sehingga berputar cepat, sedangkan kaki yang direntangkan memperbesar inersia untuk menahan putaran balik."
  ]
}
```

---

## ✍️ Langkah 3 — Tulis Kontrak `projects/001_cat-righting-reflex/02_script.json` (`skill-02-script-architect`)

Tulis file `projects/001_cat-righting-reflex/02_script.json` dengan isi eksak berikut (seluruh `semanticChunks` berukuran 2–4 kata, klausa utuh, 100% cocok kata-per-kata dengan `voText`, dan bebas dari kata gantung):

```json
{
  "projectId": "001_cat-righting-reflex",
  "hookFormula": "visual_paradox_claim",
  "estimatedDurationSec": 30,
  "scenes": [
    {
      "sceneId": "scene_01_hook",
      "stepNumber": "01",
      "stepTitle": "REFLEKS 0,3 DETIK",
      "role": "hook",
      "voText": "Jatuhkan kucing dalam posisi terbalik, dan hanya dalam nol koma tiga detik kakinya sudah siap menginjak tanah.",
      "semanticChunks": [
        "Jatuhkan kucing",
        "dalam posisi terbalik,",
        "dan hanya dalam",
        "nol koma tiga detik",
        "kakinya sudah siap",
        "menginjak tanah."
      ],
      "displayHeadline": "PUTAR 180° DALAM 0,3 DETIK",
      "pillBadge": "STEP 01 // HOOK FISIKA",
      "heroStat": {
        "number": "0,3s",
        "subLabel": "ROTASI UDARA 180°"
      },
      "calloutLabel": "Cat Righting Reflex",
      "highlightWords": ["terbalik", "nol", "tiga", "detik", "menginjak"],
      "sfxCues": [
        { "type": "whoosh", "triggerOnWord": "Jatuhkan" },
        { "type": "impact", "triggerOnWord": "detik" }
      ]
    },
    {
      "sceneId": "scene_02_paradox",
      "stepNumber": "02",
      "stepTitle": "PARADOKS MOMENTUM NOL",
      "role": "open_loop",
      "voText": "Padahal di udara tidak ada pijakan untuk menolak. Menurut hukum fisika, total momentum sudutnya wajib tetap nol.",
      "semanticChunks": [
        "Padahal di udara",
        "tidak ada pijakan",
        "untuk menolak.",
        "Menurut hukum fisika,",
        "total momentum sudutnya",
        "wajib tetap nol."
      ],
      "displayHeadline": "TANPA PIJAKAN = MUSTAHIL?",
      "pillBadge": "STEP 02 // PARADOKS FISIKA",
      "heroStat": {
        "number": "L = 0",
        "subLabel": "KEKEKALAN MOMENTUM SUDUT"
      },
      "calloutLabel": "Zero External Torque",
      "highlightWords": ["udara", "pijakan", "fisika", "momentum", "nol"],
      "sfxCues": [
        { "type": "whoosh", "triggerOnWord": "Padahal" },
        { "type": "highlight", "triggerOnWord": "nol" }
      ]
    },
    {
      "sceneId": "scene_03_mechanism",
      "stepNumber": "03",
      "stepTitle": "TRIK 2 POROS INERSIA",
      "role": "mechanism",
      "voText": "Rahasianya, tulang belakang kucing bekerja seperti dua poros terpisah. Kaki depan ditekuk rapat agar berputar cepat, sementara kaki belakang direntangkan.",
      "semanticChunks": [
        "Rahasianya, tulang",
        "belakang kucing bekerja",
        "seperti dua poros terpisah.",
        "Kaki depan",
        "ditekuk rapat",
        "agar berputar cepat,",
        "sementara kaki belakang direntangkan."
      ],
      "displayHeadline": "TEKUK DEPAN, RENTANG BELAKANG",
      "pillBadge": "STEP 03 // BEND & TWIST",
      "heroStat": {
        "number": "+180°",
        "subLabel": "POROS DEPAN vs BELAKANG -30°"
      },
      "calloutLabel": "Split-Axis Moment of Inertia",
      "highlightWords": ["tulang", "dua", "poros", "ditekuk", "cepat", "direntangkan"],
      "sfxCues": [
        { "type": "whoosh", "triggerOnWord": "Rahasianya" },
        { "type": "click", "triggerOnWord": "ditekuk" },
        { "type": "highlight", "triggerOnWord": "cepat" }
      ]
    },
    {
      "sceneId": "scene_04_payoff",
      "stepNumber": "04",
      "stepTitle": "KUNCI PENDARATAN 4 KAKI",
      "role": "payoff",
      "voText": "Lalu gantian kaki depan diluruskan untuk mengerem, dan kaki belakang ditekuk menyusul. Tanpa melanggar fisika, kucing mendarat sempurna.",
      "semanticChunks": [
        "Lalu gantian",
        "kaki depan diluruskan",
        "untuk mengerem,",
        "dan kaki belakang",
        "ditekuk menyusul.",
        "Tanpa melanggar fisika,",
        "kucing mendarat sempurna."
      ],
      "displayHeadline": "TUKAR POROS, MENDARAT MULUS",
      "pillBadge": "STEP 04 // PAYOFF FISIKA",
      "heroStat": {
        "number": "4 KAKI",
        "subLabel": "ZERO NET ANGULAR MOMENTUM"
      },
      "calloutLabel": "180° Touchdown Lock",
      "highlightWords": ["diluruskan", "mengerem", "ditekuk", "fisika", "sempurna"],
      "sfxCues": [
        { "type": "click", "triggerOnWord": "diluruskan" },
        { "type": "impact", "triggerOnWord": "sempurna" }
      ]
    }
  ]
}
```

---

## 🎬 Langkah 4 — Tulis Kontrak `projects/001_cat-righting-reflex/04_storyboard.json` (`skill-04-visual-director`)

Tulis file `projects/001_cat-righting-reflex/04_storyboard.json` dengan isi eksak berikut (`durationFrames` awal akan disinkronkan secara otomatis terhadap `03_audio_timestamps.json` oleh `scripts/build_reel.py`):

```json
{
  "projectId": "001_cat-righting-reflex",
  "canvas": {
    "width": 1080,
    "height": 1920,
    "fps": 60
  },
  "transitionDurationFrames": 14,
  "captionSafeZone": {
    "y": 1420
  },
  "scenes": [
    {
      "sceneId": "scene_01_hook",
      "startFrame": 0,
      "durationFrames": 390,
      "backdropPreset": "cobalt_blueprint",
      "visualBeatFrames": [0, 12, 45, 110, 180, 250, 310],
      "cameraMotion": {
        "type": "fast_punch_zoom",
        "fromScale": 1.0,
        "toScale": 1.07,
        "fromX": 0,
        "toX": 0,
        "fromY": 0,
        "toY": -16,
        "parallaxStrength": 0.48
      },
      "headline": {
        "text": "PUTAR 180° DALAM 0,3 DETIK",
        "x": 540,
        "y": 410,
        "enterAtRelativeFrame": 0
      },
      "elements": [
        {
          "component": "TerminalHeader",
          "enterAtRelativeFrame": 0,
          "props": {
            "handle": "@biomechanics.lab",
            "eyebrow": "BEDAH FISIKA // CAT RIGHTING REFLEX",
            "telemetryTag": "HIGH-SPEED 60FPS",
            "x": 540,
            "y": 175
          }
        },
        {
          "component": "StepProgressPills",
          "enterAtRelativeFrame": 12,
          "props": {
            "activeStep": 1,
            "stepTitle": "STEP 01 // HOOK FISIKA",
            "x": 540,
            "y": 285
          }
        },
        {
          "component": "HeroStatCallout",
          "enterAtRelativeFrame": 45,
          "props": {
            "value": "0.3s",
            "subLabel": "WAKTU PUTAR 180° DI UDARA",
            "animateCountUp": true,
            "x": 540,
            "y": 690
          }
        },
        {
          "component": "BoundingBoxFrame",
          "enterAtRelativeFrame": 110,
          "props": {
            "title": "INVERTED DROP DETECTED",
            "highlightTag": "180° -> 0°",
            "subtitle": "Vestibular System Lock in 30ms",
            "dimensionLabel": "740 × 320 px",
            "width": 740,
            "height": 320,
            "x": 540,
            "y": 980
          }
        },
        {
          "component": "FloatingStickerCard",
          "enterAtRelativeFrame": 180,
          "props": {
            "badge": "REFLEX LOCK",
            "label": "0,3 DETIK SIAP MENDARAT",
            "subtext": "Tanpa bantuan tumpuan awal",
            "accentColor": "#A3E635",
            "tiltDeg": -3.0,
            "x": 540,
            "y": 1210
          }
        },
        {
          "component": "HighlightBadge",
          "enterAtRelativeFrame": 250,
          "props": {
            "text": "ROTASI INSTAN 180 DERAJAT",
            "openLoopText": "TAPI BAGAIMANA TANPA PIJAKAN?",
            "openLoopAtRelativeFrame": 310,
            "x": 540,
            "y": 1290
          }
        }
      ]
    },
    {
      "sceneId": "scene_02_paradox",
      "startFrame": 390,
      "durationFrames": 420,
      "backdropPreset": "cobalt_blueprint",
      "visualBeatFrames": [0, 12, 45, 115, 185, 255, 315],
      "cameraMotion": {
        "type": "dramatic_push",
        "fromScale": 1.0,
        "toScale": 1.08,
        "fromX": 0,
        "toX": -10,
        "fromY": 0,
        "toY": -18,
        "parallaxStrength": 0.5
      },
      "headline": {
        "text": "TANPA PIJAKAN = MUSTAHIL?",
        "x": 540,
        "y": 410,
        "enterAtRelativeFrame": 0
      },
      "elements": [
        {
          "component": "TerminalHeader",
          "enterAtRelativeFrame": 0,
          "props": {
            "handle": "@biomechanics.lab",
            "eyebrow": "HUKUM KEKEKALAN // MOMENTUM SUDUT",
            "telemetryTag": "TORQUE = 0 N·m",
            "x": 540,
            "y": 175
          }
        },
        {
          "component": "StepProgressPills",
          "enterAtRelativeFrame": 12,
          "props": {
            "activeStep": 2,
            "stepTitle": "STEP 02 // PARADOKS FISIKA",
            "x": 540,
            "y": 285
          }
        },
        {
          "component": "BoundingBoxFrame",
          "enterAtRelativeFrame": 45,
          "props": {
            "title": "CONSERVATION OF ANGULAR MOMENTUM",
            "highlightTag": "L = I1·ω1 + I2·ω2 = 0",
            "subtitle": "Zero External Torque in Freefall",
            "dimensionLabel": "760 × 360 px",
            "width": 760,
            "height": 360,
            "x": 540,
            "y": 720
          }
        },
        {
          "component": "TelemetryHUD",
          "enterAtRelativeFrame": 115,
          "props": {
            "x": 540,
            "y": 1050,
            "cards": [
              { "label": "TORSI LUAR", "value": "0 N·m", "accent": "rose" },
              { "label": "MOMENTUM TOTAL", "value": "L = 0", "accent": "cyan" },
              { "label": "PIJAKAN UDARA", "value": "NIHIL", "accent": "amber" }
            ]
          }
        },
        {
          "component": "FloatingStickerCard",
          "enterAtRelativeFrame": 185,
          "props": {
            "badge": "PARADOKS FISIKA",
            "label": "MUSTAHIL PUTAR KAKU",
            "subtext": "Benda kaku tak bisa memutar dirinya sendiri",
            "accentColor": "#FACC15",
            "tiltDeg": 2.8,
            "x": 540,
            "y": 1210
          }
        },
        {
          "component": "HighlightBadge",
          "enterAtRelativeFrame": 255,
          "props": {
            "text": "TOTAL MOMENTUM WAJIB TETAP NOL",
            "openLoopText": "RAHASIANYA ADA DI TULANG BELAKANG!",
            "openLoopAtRelativeFrame": 315,
            "x": 540,
            "y": 1290
          }
        }
      ]
    },
    {
      "sceneId": "scene_03_mechanism",
      "startFrame": 810,
      "durationFrames": 540,
      "backdropPreset": "cobalt_blueprint",
      "visualBeatFrames": [0, 12, 45, 120, 200, 280, 350, 420],
      "cameraMotion": {
        "type": "dynamic_pan_zoom",
        "fromScale": 1.0,
        "toScale": 1.08,
        "fromX": -8,
        "toX": 8,
        "fromY": 0,
        "toY": -16,
        "parallaxStrength": 0.52
      },
      "headline": {
        "text": "TEKUK DEPAN, RENTANG BELAKANG",
        "x": 540,
        "y": 410,
        "enterAtRelativeFrame": 0
      },
      "elements": [
        {
          "component": "TerminalHeader",
          "enterAtRelativeFrame": 0,
          "props": {
            "handle": "@biomechanics.lab",
            "eyebrow": "MEKANIKA BEND & TWIST // 2 POROS",
            "telemetryTag": "I = m·r² SPLIT",
            "x": 540,
            "y": 175
          }
        },
        {
          "component": "StepProgressPills",
          "enterAtRelativeFrame": 12,
          "props": {
            "activeStep": 3,
            "stepTitle": "STEP 03 // BEND & TWIST",
            "x": 540,
            "y": 285
          }
        },
        {
          "component": "PhysicsDiagramCanvas",
          "enterAtRelativeFrame": 45,
          "props": {
            "mode": "vector_split",
            "fromPitchDeg": -25,
            "toPitchDeg": 25,
            "rearRpm": 180,
            "frontRpm": 30,
            "showVectors": true,
            "showRpmBars": true,
            "showDrag": true,
            "showGimbalCone": true,
            "x": 540,
            "y": 740
          }
        },
        {
          "component": "TelemetryHUD",
          "enterAtRelativeFrame": 120,
          "props": {
            "x": 540,
            "y": 1080,
            "cards": [
              { "label": "POROS DEPAN (TEKUK)", "value": "+180°", "accent": "cyan" },
              { "label": "POROS BELAKANG (RENTANG)", "value": "-30°", "accent": "amber" },
              { "label": "TOTAL L1 + L2", "value": "0.00", "accent": "emerald" }
            ]
          }
        },
        {
          "component": "FloatingStickerCard",
          "enterAtRelativeFrame": 200,
          "props": {
            "badge": "INERSIA KECIL (r↓)",
            "label": "KAKI DEPAN DITEKUK RAPAT",
            "subtext": "Radius kecil = putaran depan jauh lebih cepat",
            "accentColor": "#38BDF8",
            "tiltDeg": -2.5,
            "x": 540,
            "y": 1210
          }
        },
        {
          "component": "HighlightBadge",
          "enterAtRelativeFrame": 280,
          "props": {
            "text": "2 POROS BERPUTAR BERLAWANAN ARAH",
            "openLoopText": "LALU BAGAIMANA CARA MENGEREMNYA?",
            "openLoopAtRelativeFrame": 350,
            "x": 540,
            "y": 1290
          }
        }
      ]
    },
    {
      "sceneId": "scene_04_payoff",
      "startFrame": 1350,
      "durationFrames": 450,
      "backdropPreset": "cobalt_blueprint",
      "visualBeatFrames": [0, 12, 45, 115, 190, 265, 325],
      "cameraMotion": {
        "type": "fast_punch_zoom",
        "fromScale": 1.02,
        "toScale": 1.08,
        "fromX": 0,
        "toX": 0,
        "fromY": -8,
        "toY": -20,
        "parallaxStrength": 0.48
      },
      "headline": {
        "text": "TUKAR POROS, MENDARAT MULUS",
        "x": 540,
        "y": 410,
        "enterAtRelativeFrame": 0
      },
      "elements": [
        {
          "component": "TerminalHeader",
          "enterAtRelativeFrame": 0,
          "props": {
            "handle": "@biomechanics.lab",
            "eyebrow": "FASE KEDUA // TOUCHDOWN LOCK",
            "telemetryTag": "180° COMPLETE",
            "x": 540,
            "y": 175
          }
        },
        {
          "component": "StepProgressPills",
          "enterAtRelativeFrame": 12,
          "props": {
            "activeStep": 4,
            "stepTitle": "STEP 04 // PAYOFF FISIKA",
            "x": 540,
            "y": 285
          }
        },
        {
          "component": "BoundingBoxFrame",
          "enterAtRelativeFrame": 45,
          "props": {
            "title": "PHASE 2: INERTIA SWAP & BRAKE",
            "highlightTag": "TOUCHDOWN 4 PAWS",
            "subtitle": "Front Legs Extend (Brake) + Rear Legs Tuck (Catch-Up)",
            "dimensionLabel": "760 × 340 px",
            "width": 760,
            "height": 340,
            "x": 540,
            "y": 710
          }
        },
        {
          "component": "TelemetryHUD",
          "enterAtRelativeFrame": 115,
          "props": {
            "x": 540,
            "y": 1045,
            "cards": [
              { "label": "KAKI DEPAN", "value": "LURUS (REM)", "accent": "emerald" },
              { "label": "KAKI BELAKANG", "value": "TEKUK (+180°)", "accent": "cyan" },
              { "label": "HUKUM FISIKA", "value": "100% AMAN", "accent": "amber" }
            ]
          }
        },
        {
          "component": "FloatingStickerCard",
          "enterAtRelativeFrame": 190,
          "props": {
            "badge": "TOUCHDOWN 100%",
            "label": "MENDARAT SEMPURNA 4 KAKI",
            "subtext": "Momentum sudut tetap nol dari awal hingga akhir",
            "accentColor": "#A3E635",
            "tiltDeg": -2.0,
            "x": 540,
            "y": 1205
          }
        },
        {
          "component": "HighlightBadge",
          "enterAtRelativeFrame": 265,
          "props": {
            "text": "FISIKA CERDAS DALAM 0,3 DETIK!",
            "openLoopText": "SIMPAN & SHARE KE TEMANMU!",
            "openLoopAtRelativeFrame": 325,
            "x": 540,
            "y": 1285
          }
        }
      ]
    }
  ]
}
```

---

## 🎨 Langkah 5 — Verifikasi `projects/001_cat-righting-reflex/theme_config.json` (`skill-05-motion-style-engine`)

Pastikan `projects/001_cat-righting-reflex/theme_config.json` menggunakan konfigurasi **Archetype C (`archetype_c_blueprint_canvas`)** berikut:

```json
{
  "activeArchetype": "archetype_c_blueprint_canvas",
  "paletteName": "cobalt_blueprint_highlighter",
  "colors": {
    "bgPrimary": "#1D4ED8",
    "bgSecondary": "#1E3A8A",
    "surfaceAccent": "#3B82F6",
    "surfaceCard": "#0F172A",
    "textPrimary": "#FFFFFF",
    "textSecondary": "#DBEAFE",
    "accentHighlight": "#FACC15",
    "accentSecondary": "#38BDF8",
    "accentBadge": "#FACC15",
    "accentBadgeText": "#0F172A",
    "extrudeShadow": "#0B1536"
  },
  "typography": {
    "displayFont": "Plus Jakarta Sans",
    "serifFont": "Playfair Display",
    "monoFont": "JetBrains Mono",
    "heroStatSizePx": 116,
    "headlineSizePx": 58,
    "captionSizePx": 50
  },
  "textures": {
    "paperGrainOpacity": 0.06,
    "layerDropShadow": "0 14px 32px rgba(0, 0, 0, 0.65)",
    "dashedStrokeWidth": 2.5
  }
}
```

---

## 🚀 Langkah 6 — Eksekusi TTS, Auto-Sync Frame, QA Gate, TypeScript Check & Render Penuh (`build_reel.py`)

Jalankan One-Gate CLI Runner untuk menghasilkan audio VO + word timestamps (`03_audio_timestamps.json` + `media/vo_master.mp3`), menyinkronkan durasi frame storyboard, mengaudit QA & Safe Zone (`qa_report.md`), memvalidasi TypeScript, dan merender video penuh (`001_cat-righting-reflex_v1.mp4`):

```bash
python scripts/build_reel.py --project 001_cat-righting-reflex --with-tts --render full --version-tag v1
```

### Checklist Wajib Sebelum Menyelesaikan Tugas (`Definition of Done`):
1. `projects/001_cat-righting-reflex/media/vo_master.mp3` & `public/projects/001_cat-righting-reflex/media/vo_master.mp3` terbentuk dan berukuran `> 1 KB`.
2. `projects/001_cat-righting-reflex/qa_report.md` berstatus **`PASS (READY TO RENDER)`** (0 error pada Safe Zone, Transition `14 frames`, Semantic Chunking, dan Visual Beat `<= 150 frames`).
3. `npx tsc --noEmit` lulus dengan **`Exit Code 0`**.
4. File video `projects/001_cat-righting-reflex/renders/001_cat-righting-reflex_v1.mp4` berhasil ter-render utuh.
5. Ubah baris `- **STATUS:**` di bagian atas `hub/PROMPT_QUEUE.md` menjadi `DONE`, perbarui `projects/001_cat-righting-reflex/project.meta.json` & `active_project.json` (`checkpointStage: "v1_rendered"`), dan tuliskan laporan lengkap ke **`hub/RESULT.md`**.
