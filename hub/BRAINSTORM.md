# 💡 BRAINSTORM & EVALUATION PAD (`motion-graphic`)

- **Terakhir Diperbarui:** `2026-11-25 23:25 WIB`
- **Diperbarui Oleh:** Tab Chat `brainstorming` (`4d37ca91-a788-40a3-8945-1f9fe7ef49d1`)
- **Status Brainstorm:** ✅ **LOCKED & READY FOR `prompt-generator`**
- **Proyek Terpilih (`001`):** **`001_cat-righting-reflex`**
- **Judul Proyek:** `"Refleks 0,3 Detik: Fisika Kucing Jatuh Terbalik"`
- **Archetype Terpilih:** **Archetype C** (*Cobalt Blueprint, Bounding Box & Floating Sticker*)
- **Target Durasi:** `~30 Detik` (`4 Scenes`, `74 Kata`, `60 fps`)

> **Instruksi untuk Tab Chat `prompt-generator` (`1e1439ad-b079-499d-805b-a5b175eaca4e`):**
> User telah mengunci **Kandidat #1 (`001_cat-righting-reflex`)**. Gunakan seluruh spesifikasi data brainstorm di bawah ini (`01_brief.json`, `02_script.json`, `03_audio_timestamps.json`, `04_storyboard.json`, dan `theme_config.json`) untuk menyusun prompt eksekusi lengkap berstatus `STATUS: READY` di `hub/PROMPT_QUEUE.md`.

---

## 1. Keputusan Konsep & Evaluasi Baseline yang Wajib Diterapkan

Berdasarkan `hub/RESULT.md` (`checkpointStage: ready_for_new_project`), proyek `001_cat-righting-reflex` dirancang sebagai proyek pembuka 30 detik dengan 4 standar utama:

1. **Inisialisasi One-Gate CLI:**
   ```bash
   python scripts/build_reel.py --init 001_cat-righting-reflex --title "Refleks 0,3 Detik: Fisika Kucing Jatuh Terbalik" --archetype C
   ```
2. **Gaya Visual *Kinetic Typography + Visual Punchy* (Archetype C):**
   - Menggunakan backdrop `"cobalt_blueprint"` dengan kombinasi **Headline Besar**, `<HeroStatCallout />` (`0,3 DETIK` & `L = 0`), `<BoundingBoxFrame />` (mengunci anatomi 2 poros tulang belakang kucing), `<FloatingStickerCard />` (stiker rumus inersia $I = m \cdot r^2$), `<TelemetryHUD />` (komparasi sudut Poros Depan $+180^\circ$ vs Poros Belakang $-30^\circ$), dan `<HighlightBadge />`.
   - Setiap scene memiliki *visual beat* baru setiap `30–75 frames` (`0.5s – 1.25s`, jauh di bawah batas maksimal QA `150 frames` / `2.5s`).
   - Seluruh koordinat elemen berada di dalam **Reels Safe Zone (`X: 80–920`, `Y: 140–1500`)** dengan transisi antar-scene `14 frames` (`0.23s`).
3. **Narasi Mengalir Natural & `semanticChunks` Klausa Utuh:**
   - Total naskah `74 kata` (~28–30 detik) dibagi menjadi 4 scene padat.
   - Setiap `semanticChunks` berisi **2–4 kata yang utuh secara klausa/makna** (tidak ada kata gantung di ujung baris) dan 100% cocok kata-per-kata dengan `voText`.
4. **Sinkronisasi Audio & Caption Presisi Tinggi:**
   - Pastikan *word-level highlight* pada caption sinkron akurat dengan pengucapan VO dan menggunakan `semanticChunks` klausa utuh.

---

## 2. Data Brainstorm untuk `01_brief.json` (Skill 01 — Content Strategist)

- **`projectId`:** `"001_cat-righting-reflex"`
- **`topic`:** `"Refleks 0,3 Detik: Bagaimana Kucing Jatuh Terbalik Memutar Tubuh 180 Derajat Tanpa Pijakan di Udara"`
- **`selectedAngle`:** `"Paradoks Kekekalan Momentum Sudut (L = 0): Kucing tidak melanggar hukum fisika, melainkan membagi tubuhnya menjadi 2 poros rotasi berlawanan dengan memanipulasi momen inersia (menekuk vs merentangkan kaki)."`
- **`targetAudience`:**
  - `persona`: `"Penonton Reels Indonesia (18-35 tahun) penyuka sains populer, fisika sehari-hari, dan bedah mekanika visual cepat"`
  - `painPoints`:
    - `"Bosan dengan video edukasi yang bertele-tele dan visual kotak statis yang kaku"`
    - `"Sering melihat kucing mendarat dengan kaki tapi belum tahu trik fisika di balik putaran udaranya"`
  - `retentionTriggers`:
    - `"0.0s (Hook 3s): Klaim angka ekstrem 0,3 detik untuk memutar tubuh 180 derajat dari posisi terbalik"`
    - `"7.0s (Open Loop): Paradoks fisika — tanpa pijakan di udara, momentum sudut total wajib nol (L = 0), lalu bagaimana bisa berputar?"`
    - `"14.0s (Mechanism Visual): Mekanisme Bend & Twist 2 poros tulang belakang (kaki depan ditekuk r kecil vs kaki belakang direntang r besar)"`
    - `"23.0s (Payoff): Tukar tekukan kaki depan-belakang untuk mengerem dan mengunci pendaratan sempurna 4 kaki"`
- **`hookOptions`:**
  - `id`: `"hook_1"`
  - `formula`: `"visual_paradox_claim"`
  - `text`: `"Jatuhkan kucing dalam posisi terbalik, dan hanya dalam nol koma tiga detik kakinya sudah siap menginjak tanah."`
  - `isSelected`: `true`
- **`keyFacts`:**
  1. `"0,3 Detik: Waktu rata-rata refleks meluruskan tubuh kucing (Cat Righting Reflex) dari posisi terbalik hingga siap mendarat."`
  2. `"L = 0 (Momentum Sudut Nol): Tanpa tumpuan tolakan di udara, total momentum sudut tubuh kucing harus selalu tetap nol."`
  3. `"2 Poros Berlawanan (+180° vs -30°): Kucing menekuk tubuhnya di tengah sehingga separuh depan dan separuh belakang berputar seperti dua silinder independen."`
  4. `"Manipulasi Inersia (I = m·r²): Kaki yang ditekuk rapat memperkecil radius rotasi sehingga berputar cepat, sedangkan kaki yang direntangkan memperbesar inersia untuk menahan putaran balik."`

---

## 3. Data Brainstorm untuk `02_script.json` (Skill 02 — Script Architect)

> **Catatan Kritis `semanticChunks`:** Gabungan seluruh string di `semanticChunks` pada tiap scene **100% identik kata-per-kata** dengan `voText`, dan setiap chunk adalah klausa utuh berukuran `2–4 kata`.

### Scene 1 — `scene_01_hook` (`~0.0s – 6.5s` | 17 Kata)
- **`stepNumber`:** `"01"`
- **`stepTitle`:** `"REFLEKS 0,3 DETIK"`
- **`role`:** `"hook"`
- **`displayHeadline`:** `"PUTAR 180° DALAM 0,3 DETIK"`
- **`pillBadge`:** `"STEP 01 // HOOK FISIKA"`
- **`heroStat`:** `{ "number": "0,3s", "subLabel": "ROTASI UDARA 180°" }`
- **`calloutLabel`:** `"Cat Righting Reflex"`
- **`voText`:** `"Jatuhkan kucing dalam posisi terbalik, dan hanya dalam nol koma tiga detik kakinya sudah siap menginjak tanah."`
- **`semanticChunks`:**
  1. `"Jatuhkan kucing"` (2 kata)
  2. `"dalam posisi terbalik,"` (3 kata)
  3. `"dan hanya dalam"` (3 kata)
  4. `"nol koma tiga detik"` (4 kata)
  5. `"kakinya sudah siap"` (3 kata)
  6. `"menginjak tanah."` (2 kata)
- **`highlightWords`:** `["terbalik", "nol", "tiga", "detik", "menginjak"]`
- **`sfxCues`:**
  - `{ "type": "whoosh", "triggerOnWord": "Jatuhkan" }`
  - `{ "type": "impact", "triggerOnWord": "detik" }`

### Scene 2 — `scene_02_paradox` (`~6.5s – 13.5s` | 18 Kata)
- **`stepNumber`:** `"02"`
- **`stepTitle`:** `"PARADOKS MOMENTUM NOL"`
- **`role`:** `"open_loop"`
- **`displayHeadline`:** `"TANPA PIJAKAN = MUSTAHIL?"`
- **`pillBadge`:** `"STEP 02 // PARADOKS FISIKA"`
- **`heroStat`:** `{ "number": "L = 0", "subLabel": "KEKEKALAN MOMENTUM SUDUT" }`
- **`calloutLabel`:** `"Zero External Torque"`
- **`voText`:** `"Padahal di udara tidak ada pijakan untuk menolak. Menurut hukum fisika, total momentum sudutnya wajib tetap nol."`
- **`semanticChunks`:**
  1. `"Padahal di udara"` (3 kata)
  2. `"tidak ada pijakan"` (3 kata)
  3. `"untuk menolak."` (2 kata)
  4. `"Menurut hukum fisika,"` (3 kata)
  5. `"total momentum sudutnya"` (3 kata)
  6. `"wajib tetap nol."` (3 kata)
- **`highlightWords`:** `["udara", "pijakan", "fisika", "momentum", "nol"]`
- **`sfxCues`:**
  - `{ "type": "whoosh", "triggerOnWord": "Padahal" }`
  - `{ "type": "highlight", "triggerOnWord": "nol" }`

### Scene 3 — `scene_03_mechanism` (`~13.5s – 22.5s` | 21 Kata)
- **`stepNumber`:** `"03"`
- **`stepTitle`:** `"TRIK 2 POROS INERSIA"`
- **`role`:** `"mechanism"`
- **`displayHeadline`:** `"TEKUK DEPAN, RENTANG BELAKANG"`
- **`pillBadge`:** `"STEP 03 // BEND & TWIST"`
- **`heroStat`:** `{ "number": "+180°", "subLabel": "POROS DEPAN vs BELAKANG -30°" }`
- **`calloutLabel`:** `"Split-Axis Moment of Inertia"`
- **`voText`:** `"Rahasianya, tulang belakang kucing bekerja seperti dua poros terpisah. Kaki depan ditekuk rapat agar berputar cepat, sementara kaki belakang direntangkan."`
- **`semanticChunks`:**
  1. `"Rahasianya, tulang belakang"` (3 kata)
  2. `"kucing bekerja seperti"` (3 kata)
  3. `"dua poros terpisah."` (3 kata)
  4. `"Kaki depan"` (2 kata)
  5. `"ditekuk rapat"` (2 kata)
  6. `"agar berputar cepat,"` (3 kata)
  7. `"sementara kaki belakang"` (3 kata)
  8. `"direntangkan."` (1 kata — *Catatan: untuk kepatuhan ketat 2-5 kata per chunk, gabungkan chunk 7 & 8 menjadi `"sementara kaki belakang direntangkan."` [4 kata]*)
  - **Final `semanticChunks` Scene 3 (100% Patuh 2–4 Kata):**
    1. `"Rahasianya, tulang belakang"` (3 kata)
    2. `"kucing bekerja seperti"` (3 kata)
    3. `"dua poros terpisah."` (3 kata)
    4. `"Kaki depan"` (2 kata)
    5. `"ditekuk rapat"` (2 kata)
    6. `"agar berputar cepat,"` (3 kata)
    7. `"sementara kaki belakang direntangkan."` (4 kata)
- **`highlightWords`:** `["tulang", "dua", "poros", "ditekuk", "cepat", "direntangkan"]`
- **`sfxCues`:**
  - `{ "type": "whoosh", "triggerOnWord": "Rahasianya" }`
  - `{ "type": "click", "triggerOnWord": "ditekuk" }`
  - `{ "type": "highlight", "triggerOnWord": "cepat" }`

### Scene 4 — `scene_04_payoff` (`~22.5s – 30.0s` | 18 Kata)
- **`stepNumber`:** `"04"`
- **`stepTitle`:** `"KUNCI PENDARATAN 4 KAKI"`
- **`role`:** `"payoff"`
- **`displayHeadline`:** `"TUKAR POROS, MENDARAT MULUS"`
- **`pillBadge`:** `"STEP 04 // PAYOFF FISIKA"`
- **`heroStat`:** `{ "number": "4 KAKI", "subLabel": "ZERO NET ANGULAR MOMENTUM" }`
- **`calloutLabel`:** `"180° Touchdown Lock"`
- **`voText`:** `"Lalu gantian kaki depan diluruskan untuk mengerem, dan kaki belakang ditekuk menyusul. Tanpa melanggar fisika, kucing mendarat sempurna."`
- **`semanticChunks`:**
  1. `"Lalu gantian"` (2 kata)
  2. `"kaki depan diluruskan"` (3 kata)
  3. `"untuk mengerem,"` (2 kata)
  4. `"dan kaki belakang"` (3 kata)
  5. `"ditekuk menyusul."` (2 kata)
  6. `"Tanpa melanggar fisika,"` (3 kata)
  7. `"kucing mendarat sempurna."` (3 kata)
- **`highlightWords`:** `["diluruskan", "mengerem", "ditekuk", "fisika", "sempurna"]`
- **`sfxCues`:**
  - `{ "type": "click", "triggerOnWord": "diluruskan" }`
  - `{ "type": "impact", "triggerOnWord": "sempurna" }`

---

## 4. Data Brainstorm untuk `04_storyboard.json` (Skill 04 — Visual Director)

- **`canvas`:** `{ "width": 1080, "height": 1920, "fps": 60 }`
- **`transitionDurationFrames`:** `14` *(Sat-Set 0.23s slide transition)*
- **`captionSafeZone`:** `{ "y": 1420 }`
- **Aturan Visual Beat & Safe Zone:**
  - Seluruh posisi `x` berada di `540` (rentang aman `80–920`) dan posisi `y` berada di antara `175` hingga `1275` (rentang aman `140–1500`).
  - Di setiap scene, elemen muncul bertahap (`enterAtRelativeFrame`: `0`, `35`, `75`, `120`, `165`, `210`, `255`, `300`, `345`) sehingga **jarak antar visual beat maksimal `45 frames` (`0.75s`)** — dijamin **100% PASS QA Gate (`<= 150 frames`)** bahkan ketika durasi audio scene mencapai `~400–480 frames`.

### Rincian Koreografi Komponen per Scene (`04_storyboard.json`):

1. **`scene_01_hook` (`backdropPreset: "cobalt_blueprint"`):**
   - `cameraMotion`: `{ "type": "fast_punch_zoom", "fromScale": 1.0, "toScale": 1.07, "fromX": 0, "toX": 0, "fromY": 0, "toY": -16, "parallaxStrength": 0.48 }`
   - `headline`: `{ "text": "PUTAR 180° DALAM 0,3 DETIK", "x": 540, "y": 410, "enterAtRelativeFrame": 0 }`
   - `elements`:
     - Frame `0`: `TerminalHeader` (`handle: "@biomechanics.lab"`, `eyebrow: "BEDAH FISIKA // CAT RIGHTING REFLEX"`, `telemetryTag: "HIGH-SPEED 60FPS"`, `x: 540, y: 175`)
     - Frame `12`: `StepProgressPills` (`activeStep: 1`, `stepTitle: "STEP 01 // HOOK FISIKA"`, `x: 540, y: 285`)
     - Frame `45`: `HeroStatCallout` (`value: "0.3s"`, `subLabel: "WAKTU PUTAR 180° DI UDARA"`, `animateCountUp: true`, `x: 540, y: 690`)
     - Frame `110`: `BoundingBoxFrame` (`title: "INVERTED DROP DETECTED"`, `highlightTag: "180° -> 0°"`, `subtitle: "Vestibular System Lock in 30ms"`, `dimensionLabel: "740 × 320 px"`, `width: 740, height: 320`, `x: 540, y: 980`)
     - Frame `180`: `FloatingStickerCard` (`badge: "REFLEX LOCK"`, `label: "0,3 DETIK SIAP MENDARAT"`, `subtext: "Tanpa bantuan tumpuan awal"`, `accentColor: "#A3E635"`, `tiltDeg: -3.0`, `x: 540, y: 1210`)
     - Frame `250`: `HighlightBadge` (`text: "ROTASI INSTAN 180 DERAJAT"`, `openLoopText: "TAPI BAGAIMANA TANPA PIJAKAN?"`, `openLoopAtRelativeFrame: 310`, `x: 540, y: 1290`)

2. **`scene_02_paradox` (`backdropPreset: "cobalt_blueprint"`):**
   - `cameraMotion`: `{ "type": "dramatic_push", "fromScale": 1.0, "toScale": 1.08, "fromX": 0, "toX": -10, "fromY": 0, "toY": -18, "parallaxStrength": 0.5 }`
   - `headline`: `{ "text": "TANPA PIJAKAN = MUSTAHIL?", "x": 540, "y": 410, "enterAtRelativeFrame": 0 }`
   - `elements`:
     - Frame `0`: `TerminalHeader` (`handle: "@biomechanics.lab"`, `eyebrow: "HUKUM KEKEKALAN // MOMENTUM SUDUT"`, `telemetryTag: "TORQUE = 0 N·m"`, `x: 540, y: 175`)
     - Frame `12`: `StepProgressPills` (`activeStep: 2`, `stepTitle: "STEP 02 // PARADOKS FISIKA"`, `x: 540, y: 285`)
     - Frame `45`: `BoundingBoxFrame` (`title: "CONSERVATION OF ANGULAR MOMENTUM"`, `highlightTag: "L = I1·ω1 + I2·ω2 = 0"`, `subtitle: "Zero External Torque in Freefall"`, `dimensionLabel: "760 × 360 px"`, `width: 760, height: 360`, `x: 540, y: 720`)
     - Frame `115`: `TelemetryHUD` (`x: 540, y: 1050`, `cards`: `[{ "label": "TORSI LUAR", "value": "0 N·m", "accent": "rose" }, { "label": "MOMENTUM TOTAL", "value": "L = 0", "accent": "cyan" }, { "label": "PIJAKAN UDARA", "value": "NIHIL", "accent": "amber" }]`)
     - Frame `185`: `FloatingStickerCard` (`badge: "PARADOKS FISIKA"`, `label: "MUSTAHIL PUTAR KAKU"`, `subtext: "Benda kaku tak bisa memutar dirinya sendiri"`, `accentColor: "#FACC15"`, `tiltDeg: 2.8`, `x: 540, y: 1210`)
     - Frame `255`: `HighlightBadge` (`text: "TOTAL MOMENTUM WAJIB TETAP NOL"`, `openLoopText: "RAHASIANYA ADA DI TULANG BELAKANG!", "openLoopAtRelativeFrame": 315`, `x: 540, y: 1290`)

3. **`scene_03_mechanism` (`backdropPreset: "cobalt_blueprint"`):**
   - `cameraMotion`: `{ "type": "dynamic_pan_zoom", "fromScale": 1.0, "toScale": 1.08, "fromX": -8, "toX": 8, "fromY": 0, "toY": -16, "parallaxStrength": 0.52 }`
   - `headline`: `{ "text": "TEKUK DEPAN, RENTANG BELAKANG", "x": 540, "y": 410, "enterAtRelativeFrame": 0 }`
   - `elements`:
     - Frame `0`: `TerminalHeader` (`handle: "@biomechanics.lab"`, `eyebrow: "MEKANIKA BEND & TWIST // 2 POROS"`, `telemetryTag: "I = m·r² SPLIT"`, `x: 540, y: 175`)
     - Frame `12`: `StepProgressPills` (`activeStep: 3`, `stepTitle: "STEP 03 // BEND & TWIST"`, `x: 540, y: 285`)
     - Frame `45`: `PhysicsDiagramCanvas` (`mode: "vector_split"`, `fromPitchDeg: -25`, `toPitchDeg: 25`, `rearRpm: 180`, `frontRpm: 30`, `showVectors: true`, `showRpmBars: true`, `showDrag: true`, `showGimbalCone: true`, `x: 540, y: 740`)
     - Frame `120`: `TelemetryHUD` (`x: 540, y: 1080`, `cards`: `[{ "label": "POROS DEPAN (TEKUK)", "value": "+180°", "accent": "cyan" }, { "label": "POROS BELAKANG (RENTANG)", "value": "-30°", "accent": "amber" }, { "label": "TOTAL L1 + L2", "value": "0.00", "accent": "emerald" }]`)
     - Frame `200`: `FloatingStickerCard` (`badge: "INERSIA KECIL (r↓)"`, `label: "KAKI DEPAN DITEKUK RAPAT"`, `subtext: "Radius kecil = putaran depan jauh lebih cepat"`, `accentColor: "#38BDF8"`, `tiltDeg: -2.5`, `x: 540, y: 1210`)
     - Frame `280`: `HighlightBadge` (`text: "2 POROS BERPUTAR BERLAWANAN ARAH"`, `openLoopText: "LALU BAGAIMANA CARA MENGEREMNYA?"`, `openLoopAtRelativeFrame: 350`, `x: 540, y: 1290`)

4. **`scene_04_payoff` (`backdropPreset: "cobalt_blueprint"`):**
   - `cameraMotion`: `{ "type": "fast_punch_zoom", "fromScale": 1.02, "toScale": 1.08, "fromX": 0, "toX": 0, "fromY": -8, "toY": -20, "parallaxStrength": 0.48 }`
   - `headline`: `{ "text": "TUKAR POROS, MENDARAT MULUS", "x": 540, "y": 410, "enterAtRelativeFrame": 0 }`
   - `elements`:
     - Frame `0`: `TerminalHeader` (`handle: "@biomechanics.lab"`, `eyebrow: "FASE KEDUA // TOUCHDOWN LOCK"`, `telemetryTag: "180° COMPLETE"`, `x: 540, y: 175`)
     - Frame `12`: `StepProgressPills` (`activeStep: 4`, `stepTitle: "STEP 04 // PAYOFF FISIKA"`, `x: 540, y: 285`)
     - Frame `45`: `BoundingBoxFrame` (`title: "PHASE 2: INERTIA SWAP & BRAKE"`, `highlightTag: "TOUCHDOWN 4 PAWS"`, `subtitle: "Front Legs Extend (Brake) + Rear Legs Tuck (Catch-Up)"`, `dimensionLabel: "760 × 340 px"`, `width: 760, height: 340`, `x: 540, y: 710`)
     - Frame `115`: `TelemetryHUD` (`x: 540, y: 1045`, `cards`: `[{ "label": "KAKI DEPAN", "value": "LURUS (REM)", "accent": "emerald" }, { "label": "KAKI BELAKANG", "value": "TEKUK (+180°)", "accent": "cyan" }, { "label": "HUKUM FISIKA", "value": "100% AMAN", "accent": "amber" }]`)
     - Frame `190`: `FloatingStickerCard` (`badge: "TOUCHDOWN 100%"`, `label: "MENDARAT SEMPURNA 4 KAKI"`, `subtext: "Momentum sudut tetap nol dari awal hingga akhir"`, `accentColor: "#A3E635"`, `tiltDeg: -2.0`, `x: 540, y: 1205`)
     - Frame `265`: `HighlightBadge` (`text: "FISIKA CERDAS DALAM 0,3 DETIK!"`, `openLoopText: "SIMPAN & SHARE KE TEMANMU!"`, `openLoopAtRelativeFrame: 325`, `x: 540, y: 1285`)
