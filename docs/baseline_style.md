# Baseline Visual, Motion & Storytelling Style Guide
**Project:** Automated Instagram Reels Production System (`Video-as-Code` / Remotion 1080x1920 @ 60fps)  
**Sumber Analisis:** 7 Referensi Reels & Post (`@motionformat`, `@getalgopicks`, `@mimi.mosaic`, `@wilingonten`, `@ciwankcyril`, `@tessa.fairbrook`)

---

## 1. Sintesis DNA Visual & Archetype Utama

Dari ke-7 referensi yang dibedah, terdapat **3 pilar gaya visual (Visual Archetypes)** yang saling melengkapi dan sangat ideal dieksekusi secara prosedural menggunakan kode (React/SVG/Canvas di Remotion):

### Archetype A: "Editorial 2D Explainer & Layered Vector" (Acuan Utama: `@motionformat` Ref #1 & #2)
- **Karakteristik:** Full motion graphics tanpa wajah (*faceless explainer*). Mengandalkan latar bertekstur (paper-cut/grain/strata), ilustrasi vektor flat berlapis dengan *depth shadow*, angka statistik raksasa, *circular magnifier callout*, dan garis bantu putus-putus (*dashed vector lines*).
- **Kapan Digunakan:** Konten edukasi, sains, sejarah, fakta unik, perbandingan data, atau storytelling naratif.

### Archetype B: "Dark Developer UI & Tech Listicle" (Acuan Utama: `@wilingonten` Ref #5 & `@tessa.fairbrook` Ref #7)
- **Karakteristik:** Latar gelap pekat (*dark charcoal/obsidian*) dengan *ambient radial glow* (merah crimson, biru elektrik, atau ungu), *header bar* ala terminal/browser (`@username`), *numbered step pills* (`01`, `02`, `03`, `04`), *vertical glowing accent bar*, dan *floating UI/repo cards*.
- **Kapan Digunakan:** Konten tutorial tech/AI, *listicle* ("5 Tools...", "7 Repo..."), tips produktivitas, dan *contrarian opini*.

### Archetype C: "Blueprint Canvas & Pop-Up Sticker Hybrid" (Acuan Utama: `@getalgopicks` Ref #3 & `@ciwankcyril` Ref #6)
- **Karakteristik:** Latar *blueprint grid* lengkap dengan skala penggaris (*ruler ticks*), *bounding box* putih dengan 8 *resize handles* (gaya editor Figma/After Effects), *yellow highlighter bar* pada teks kunci, serta *floating rounded-square sticker card* yang muncul dengan efek *spring pop-in*.
- **Kapan Digunakan:** Breakdown *workflow*, showcase *before-after*, atau penekanan poin penting/nama *tools*.

---

## 2. Formula Hook 3 Detik Pertama (0.0s – 3.0s)

Semua referensi dengan *engagement* tinggi menggunakan salah satu dari **4 pola Hook** berikut pada 180 frame pertama (60fps):

| Tipe Hook | Pola Copywriting | Contoh dari Referensi | Eksekusi Visual (0–3 Detik) |
| :--- | :--- | :--- | :--- |
| **1. Extreme Contrast / Fact** | Membandingkan dua hal yang tampak mustahil secara kronologis/skala | *"Hiu sudah berenang di laut sebelum pohon pertama tumbuh"* (Ref #1) | Angka raksasa (`420 ± JUTA TAHUN`) + *zoom-in magnifier* berputar dengan *dashed ring* |
| **2. Contrarian Command** | Larangan tegas yang mematahkan kebiasaan lama + solusi baru | *"JANGAN NGEDIT — PAKAI CLAUDE CODE"* (Ref #5) | Tipografi *heavy uppercase* rata kiri + *step pills* `01-04` + ikon maskot bergaris gerak |
| **3. Relatable Pain Point** | Pertanyaan singkat yang menyentuh frustrasi audiens | *"Udah jadi, tapi kok kurang sreg?"* (Ref #2) | Teks tengah di atas latar gelap berbintang, kata kunci (*"kurang sreg?"*) diberi warna aksen kuning |
| **4. Curiosity-Gap / Secret Workflow** | Klaim hasil nyata atau penemuan baru setelah waktu lama | *"Animated reels with Claude Code"* / *"6 years of editing and NOW I find this???"* (Ref #3, #4) | *Highlighter bar* kuning kontras + *bounding box* visual hasil akhir |

**Aturan Baku Hook di Sistem Kita:**
1. **Frame 0 (0.0s) Harus Sudah Berisi Visual & Headline Hook:** Tidak boleh ada *fade-in* lambat dari layar kosong, agar *thumbnail* otomatis memikat dan tidak terjadi *drop-off* di detik pertama.
2. **Maksimal 6–8 Kata di Layar Hook:** Gunakan kontras ukuran ekstrem atau *highlighter badge* pada 1–2 kata kunci utama.
3. **Trigger Audio & Gerakan di 0.0s – 0.5s:** Efek *spring scale* (`0.85 -> 1.0`) pada teks utama atau *badge* tepat saat kata pertama Voice Over dimulai.

---

## 3. Pacing, Ritme Transisi & Aturan Animasi (60fps)

Agar video terasa **"sat-set"**, modern, dan tidak kaku seperti slide PowerPoint, berikut adalah parameter matematis animasi untuk Remotion:

- **Durasi Total Ideal:** `20 – 35 detik` (`1200 – 2100 frames` @ 60fps).
- **Kecepatan Pergantian Visual (Visual Beat):**
  - Setiap **2.0 – 3.5 detik** (`120 – 210 frames`) wajib ada perubahan *state* visual utama (pergantian *scene*, masuknya *callout/card* baru, *camera pan/zoom*, atau perubahan *mood* warna seperti transisi *Siang -> Malam -> Badai* di Ref #2).
  - Setiap **0.8 – 1.5 detik** ada *micro-motion* (kata aktif pada *kinetic subtitle*, angka yang berhitung/*counter*, *step pill* yang menyala, atau *floating sticker*).
- **Kurva Fisika (Spring & Easing):**
  - **Pop-In Elemen (Badge, Sticker, Magnifier, Card):** Gunakan `spring({ fps: 60, config: { damping: 14, stiffness: 180, mass: 0.8 } })` (memberikan sedikit *overshoot* snappy tanpa memantul berlebihan).
  - **Transisi Antar-Scene (Slide / Wipe / Camera Zoom):** Gunakan `Easing.bezier(0.22, 1, 0.36, 1)` (cepat di awal, mendarat sangat halus) selama `18 – 24 frames` (`0.3s – 0.4s`).
  - **Ambient Continuous Motion:** Selama suatu *scene* aktif, latar atau ilustrasi tidak pernah mati total—selalu ada gerakan lambat konstan (contoh: `Math.sin(frame / 30)` untuk efek mengambang pada awan/kapal/ikon, rotasi lambat `0.2 deg/frame` pada *dashed circle*, atau pergeseran *parallax* `0.5px/frame`).

---

## 4. Sistem Palet Warna (Color Tokens)

Sistem akan mendukung **3 Preset Tema Warna** yang terinspirasi langsung dari referensi dan dapat dipilih otomatis berdasarkan topik video:

### Tema 1: `Oceanic Science & Nature` (Inspirasi `@motionformat` Ref #1)
- `bgPrimary`: `#0B2538` (Deep Abyssal Navy)
- `bgSecondary`: `#16425B` (Ocean Teal)
- `surfaceAccent`: `#7A8B56` (Earth/Continent Olive Green)
- `textPrimary`: `#F8FAFC` (Crisp Off-White)
- `accentHighlight`: `#38BDF8` (Electric Cyan — untuk *active word* & *glow outline*)
- `accentSecondary`: `#FACC15` (Warm Gold — untuk *badge/stat emphasis*)

### Tema 2: `Editorial History & Story` (Inspirasi `@motionformat` Ref #2)
- `bgPrimary`: `#0D1326` (Starry Midnight Navy)
- `bgWarm`: `#D99B66` -> `#1E2942` (Sunset Tambora Gradient)
- `surfaceCard`: `#23293A` (Dark Slate Pill Background)
- `textPrimary`: `#FFF3E0` (Warm Cream Display Text)
- `textShadowExtrude`: `#8D493A` (3D Retro/Editorial Extrusion Shadow)
- `accentHighlight`: `#F6CF4C` (Bright Storm/Alert Yellow Pill `#F6CF4C` dengan teks `#0F172A`)

### Tema 3: `Dark Tech, AI & Blueprint` (Inspirasi `@wilingonten` Ref #5, `@getalgopicks` Ref #3, `@tessa.fairbrook` Ref #7)
- `bgPrimary`: `#09090B` (Obsidian Black)
- `bgBlueprint`: `#1D4ED8` (Cobalt Blueprint Grid)
- `ambientGlow`: `radial-gradient(circle, rgba(220,38,38,0.28) 0%, rgba(9,9,11,0) 70%)` (Crimson Glow) atau `rgba(139,92,246,0.28)` (Violet Glow)
- `surfaceUI`: `#18181B` dengan border `#27272A` (Terminal Pill & Step Indicators)
- `textPrimary`: `#FFFFFF` (Pure White)
- `accentHighlight`: `#EF4444` (Crimson Red) / `#FACC15` (Highlighter Yellow) / `#EA580C` (Claude Warm Orange)

---

## 5. Sistem Tipografi & Hierarki Teks

Menggunakan kombinasi **3 Peran Font** (Google Fonts yang gratis dan langsung dapat dimuat via `@remotion/google-fonts`):

1. **Primary Display & Kinetic Sans (`Plus Jakarta Sans` atau `Montserrat` — Weight 700, 800, 900):**
   - Digunakan untuk **Big Stat Numbers** (`420`, `±74.000`), **Contrarian Headlines** (`JANGAN NGEDIT`), dan **Kinetic Subtitles**.
   - Ukuran (pada kanvas `1080x1920`):
     - Big Number / Hero Stat: `110px – 150px`, `line-height: 0.95`, `letter-spacing: -0.03em`.
     - Main Headline: `72px – 96px`, `line-height: 1.05`, uppercase atau *sentence case* tebal.
     - Kinetic Subtitle (Bottom Safe Zone): `44px – 52px`, `font-weight: 800`, posisi `Y: 1380px – 1480px` (aman dari tertutup UI caption/tombol Reels).
2. **Editorial & Accent Serif (`Playfair Display` atau `Fraunces` — Weight 700, 900 & Italic):**
   - Digunakan untuk memberikan kontras *high-craft* ala `@motionformat` (`1872`) dan `@getalgopicks` (`Claude Code` italic).
   - Dipadukan tepat di bawah atau di samping font Sans-Serif untuk menciptakan estetika *modern editorial*.
3. **Technical / UI Monospace (`JetBrains Mono` — Weight 500, 700):**
   - Digunakan untuk **Eyebrow Label** (`BELAJAR BARENG...`), **Step Numbers** (`01`, `02`, `03`), **Sub-label Statistik** (`± JUTA TAHUN`, `TAHUN LALU` dengan `letter-spacing: 0.18em`), dan *ruler ticks*.

---

## 6. Katalog Komponen Motion Graphics Reusable (Untuk Fase 2)

Berdasarkan bedah visual di atas, berikut adalah **7 komponen Remotion modular** yang akan kita bangun di Fase 2:

1. **`<BackdropCanvas />`**:
   - Mendukung 3 mode latar: *Layered Paper-Cut/Grain* (dengan gelombang halus), *Dark Ambient Glow + Grid*, dan *Blueprint Ruler Grid*.
2. **`<TerminalHeader />` & `<StepProgressPills />`**:
   - Header bar di bagian atas (Safe Zone `Y: 140px`) + indikator progres nomor (`01` s/d `05`) yang otomatis menyala sesuai *scene* aktif (gaya Ref #5).
3. **`<HeroStatCallout />`**:
   - Menampilkan angka raksasa (dengan opsi animasi *count-up* atau *extruded 3D shadow*), garis pembatas horizontal, dan *pill tag* / *tracked sub-label* di bawahnya (`420 ± JUTA TAHUN` / `±74.000 TAHUN LALU` — gaya Ref #1 & #2).
4. **`<MagnifierCallout />` & `<BoundingBoxFrame />`**:
   - Lingkaran *zoom-in* berborder ganda dengan *dashed ring* berputar + garis penunjuk putus-putus ke objek (gaya Ref #1), atau bingkai *selection box* putih dengan 8 *resize handles* (gaya Ref #3).
5. **`<HighlightBadge />` & `<FloatingStickerCard />`**:
   - Pill badge kontras tinggi (`BADAI ⛈️`, `with Claude Code`) dengan animasi *wipe/pop*, serta kartu persegi-bulat (*rounded sticker*) berisi ikon SVG/logo yang muncul dengan rotasi halus (gaya Ref #2, #3, #6).
6. **`<VectorSceneIllustration />` / `<AnimatedChart />`**:
   - Komponen ilustrasi SVG berlapis (misal: siluet objek, gelombang laut/awan berlapis, grafik batang/garis dinamis, atau kartu repositori/tool) dengan *continuous floating motion*.
7. **`<WordSyncCaption />` (Auto-Caption Sinkron Suara)**:
   - Merender subtitle di *Bottom Safe Zone* berdasarkan *word-level timestamps* dari TTS. Kata yang sedang diucapkan otomatis mendapat efek *scale pop* (`1.08x`) dan warna `accentHighlight` (Cyan / Yellow), sementara kata lain dalam frasa berwarna putih solid atau putih 60% opacity.

---

## 7. Struktur Storytelling Standar (JSON Scene Schema)

Setiap video berdurasi 25–35 detik akan dibagi menjadi **5–7 Scene Terstruktur** dalam pipeline otomatis kita:

1. **`scene_1_hook` (0s – 3.5s):** Klaim mengejutkan / perbandingan ekstrem / *contrarian command* + visual *hero* langsung muncul di Frame 0.
2. **`scene_2_context` (3.5s – 8s):** Bukti data pertama / *HeroStatCallout* + *MagnifierCallout* untuk mengunci kredibilitas.
3. **`scene_3_escalation_1` (8s – 14s):** Pergeseran skala atau poin ke-1/ke-2 (*StepProgressPills* atau transformasi latar visual).
4. **`scene_4_escalation_2` (14s – 20s):** Poin ke-3 / perbandingan puncak (*AnimatedChart*, *Split Card*, atau *FloatingStickerCard*).
5. **`scene_5_twist_or_climax` (20s – 25s):** Kesimpulan tajam (*plot twist* seperti kepunahan hiu di Ref #1, atau hasil akhir *workflow* di Ref #2 & #3).
6. **`scene_6_cta` (25s – 30s):** Call-to-Action singkat & spesifik (*"Follow untuk..."* atau *"Komen [KEYWORD] buat dapetin..."*).

---

## 8. Safe Zone Instagram Reels (Kanvas 1080 x 1920)

- **Top Safe Margin:** `0px – 130px` (Hindari teks penting karena tertutup jam/kamera HP & header Reels).
- **Bottom Safe Margin:** `1520px – 1920px` (Area username, caption Instagram, dan audio ticker di bagian bawah).
- **Right Action Bar Margin:** `920px – 1080px` pada `Y: 950px – 1600px` (Area tombol Like, Comment, Share, Save).
- **Active Design Canvas (Zona Aman Utama):** `X: 80px – 920px`, `Y: 140px – 1500px`.
