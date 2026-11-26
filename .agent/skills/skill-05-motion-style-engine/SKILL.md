---
name: skill-05-motion-style-engine
description: >-
  Core Skill 05: Mengatur token visual, kurva After Effects Speed-Graph
  (src/motionCurves.ts), parameter fisika animasi "Sat-Set" di
  projects/<activeProject>/theme_config.json serta menghubungkan proyek aktif
  ke komponen Remotion (src/projectLoader.ts, src/ReelsComposition.tsx).
---

# Skill 05: Motion & Style Engine (`skill-05-motion-style-engine` — MOD-11 Upgraded)

## Peran & Tujuan
Memisahkan **Gaya Visual & Kurva Gerak (`theme_config.json` & `src/motionCurves.ts`)** dari **Struktur Konten (`04_storyboard.json`)**.

## Pustaka Kurva Gerak (`src/motionCurves.ts` — MOD-01)
1. **4 Kurva Bezier (After Effects Speed-Graph Equivalents @ 60fps):**
   - `snapIn`: `cubic-bezier(0.16, 1.0, 0.3, 1.0)` — Akselerasi eksplosif di 3 frame pertama, pengereman panjang yang mulus (default untuk pop-in kartu & bar chart).
   - `whipPan`: `cubic-bezier(0.85, 0.0, 0.15, 1.0)` — Kurva S simetris berkecepatan puncak tinggi di tengah (untuk transisi kamera & *divider wipe*).
   - `elasticOvershoot`: `cubic-bezier(0.34, 1.56, 0.64, 1.0)` — Efek *overshoot* organik untuk badge & panah target.
   - `smoothDeceleration`: `cubic-bezier(0.22, 1.0, 0.36, 1.0)` — Dolly kamera sinematik bebas patah.
2. **4 Preset Fisika Pegas (`SPRING_PRESETS`):**
   - `satSetSnap`: `{ stiffness: 290, damping: 22, mass: 0.65 }` (~21 frames settle)
   - `elasticPop`: `{ stiffness: 320, damping: 16, mass: 0.58 }` (~28 frames settle, ~7% overshoot)
   - `stickerBounce`: `{ stiffness: 310, damping: 20, mass: 0.58 }`
   - `heavyGlide`: `{ stiffness: 180, damping: 26, mass: 0.95 }`

## Tiga Archetype Palet Utama (`theme_config.json`)
- **Archetype A (`archetype_a_editorial_2d`):** `oceanic_science_nature` (`#0B2538`, `#38BDF8`, `#FACC15`)
- **Archetype B (`archetype_b_dark_engineering_ui`):** `obsidian_crimson_cyan_telemetry` (`#09090B`, `#EF4444`, `#38BDF8`, `#FACC15`)
- **Archetype C (`archetype_c_blueprint_canvas`):** `cobalt_blueprint_highlighter` (`#1D4ED8`, `#FACC15`, `#FFFFFF`)
