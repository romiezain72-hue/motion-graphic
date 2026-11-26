---
name: skill-04-visual-director
description: >-
  Core Skill 04 (Gabungan Asset 2D/3D + Visual & Motion Director): Membaca
  active_project.json, 02_script.json, dan 03_audio_timestamps.json, merancang
  visual metaphor per-detik dengan pacing "Sat-Set" (transisi 12-15 frames,
  5 variasi CameraRig presets, dan 19 komponen modular) ke dalam
  projects/<activeProject>/04_storyboard.json.
---

# Skill 04: Visual & Motion Director (`skill-04-visual-director` — MOD-10 Upgraded)

## Peran & Tujuan
Menerjemahkan `02_script.json` dan `03_audio_timestamps.json` ke dalam **`projects/<activeProject>/04_storyboard.json`** menggunakan **19 Komponen Visual Modular**, **5 Mode 3D Procedural (`@remotion/three`)**, dan **5 Preset Koreografi Kamera (`<CameraRig />`)**.

## Katalog Lengkap Komponen Visual (`04_storyboard.json -> elements[]`)

| Nama `component` | Archetype Utama | Fungsi Visual & Kapan Dipakai | Koordinat Safe Zone Ideal |
| :--- | :---: | :--- | :--- |
| `TerminalHeader` | B / C | Header bar atas `@handle`, eyebrow topik, & tag telemetri live | `x: 540, y: 175` |
| `StepProgressPills` | B / C | Indikator nomor langkah `01` s/d `06` yang menyala sesuai scene | `x: 540, y: 285` |
| `KineticTextBlock` | A / B / C | **(MOD-05)** Tipografi kinetik *per-word slide-up + blur reveal* + *accent pill box* | `x: 540, y: 580..680` |
| `HeroStatCallout` | A / B | Angka statistik raksasa (`116px`) dengan animasi *count-up* & sub-label | `x: 540, y: 740..820` |
| `MagnifierCallout` | A | Lingkaran zoom-in ber-ring putus-putus berputar untuk bedah detail | `x: 340..720, y: 460..760` |
| `AnimatedConnectorLine` | A / B / C | **(MOD-02)** Garis/panah SVG *self-drawing* (`straight`, `curved`, `elbow`) + radar node pulse | `from: {x,y}, to: {x,y}` |
| `AnimatedDataChart` | A / B / C | **(MOD-03)** Grafik data editorial (`bar`, `line`, `combo`, `horizontal_bar`) + Delta Spotlight | `x: 500, y: 800` |
| `SplitComparisonCard` | A / B / C | **(MOD-04)** Kartu komparasi `VS` (*Before vs After* / *Mitos vs Fakta*) dengan *winner glow* | `x: 540, y: 780` |
| `LiveCodeTerminal` | B / C | **(MOD-06)** Jendela kode macOS/Linux dengan efek ketik live & highlight baris aktif | `x: 540, y: 770` |
| `RadialGaugeCallout` | B / C | **(MOD-07)** Meteran cincin melingkar SVG (`%` / speedometer) + counter `tabular-nums` | `x: 540, y: 760` |
| `TimelineSlider` | A / B | **(MOD-08)** Garis waktu kronologi sejarah/evolusi dengan scrubber bergerak | `x: 540, y: 1080` |
| `PhysicsDiagramCanvas` | B | Skema CAD interaktif, vektor gaya, bar RPM, & kerucut gimbal | `x: 540, y: 775` |
| `BoundingBoxFrame` | C | Bingkai seleksi putih 8-handle ala Figma/After Effects + *Yellow Highlighter Bar* | `x: 540, y: 760` |
| `FloatingStickerCard` | C / A | Kartu stiker pop-up ber-border tebal dengan rotasi dinamis | `x: 540, y: 1140` |
| `TelemetryHUD` | B | 3 kolom kartu metrik telemetri dengan *spotlight pulse* bergilir | `x: 540, y: 1145` |
| `HighlightBadge` | A / B / C | Pill badge bawah dengan fitur **Open Loop Flip** di akhir scene | `x: 540, y: 1285` |
| `Scene3DObject` | A / B / C | Objek 3D 60fps (`wireframe_globe`, `lowpoly_planet`, `floating_chip_3d`, `neural_core_3d`, `torus_knot_3d`) | `x: 800, y: 680` |

## Aturan Koreografi Kamera (`cameraMotion.type` — MOD-09)
**DILARANG** memakai tipe kamera yang sama di semua scene! Variasikan `cameraMotion.type` sesuai fungsi naratif:
1. `"fast_punch_zoom"`: Untuk Scene 1 (Hook) — langsung mendorong perhatian mata penonton.
2. `"lateral_whip_pan"`: Untuk Scene transisi argumen / perbandingan (`SplitComparisonCard`).
3. `"zoom_out_reveal"`: Untuk Scene pembuka konteks besar / grafik data (`AnimatedDataChart` / `TimelineSlider`).
4. `"micro_turbulence"`: Untuk Scene konflik, kecepatan tinggi, atau bahaya teknis.
5. `"counter_tilt_lock"`: Untuk Scene klimaks / *Payoff* akhir.
