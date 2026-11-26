"""
Overnight Autonomous Motion Graphic Style Learner (`workflows/overnight_style_learner.py`)
------------------------------------------------------------------------------------------
Workflow ini memproses modul pembelajaran di `hub/STYLE_LAB.md`:
1. Phase 1 (Research & Visual Deconstruction):
   Sub-Agent Researcher mencari referensi teknik motion graphic (After Effects / Vox / Kurzgesagt /
   Apple / Remotion best practices) dan membedah gambar di `references/*.png`.
2. Phase 2 (Code Synthesis & TypeScript Verification):
   Sub-Agent Motion Engineer menulis/meng-upgrade kode komponen di `src/`, mendaftarkannya
   ke `src/ReelsComposition.tsx` dan `.agent/skills/skill-04-visual-director/SKILL.md`,
   lalu memverifikasi `npx tsc --noEmit` sampai PASS.
3. Phase 3 (Knowledge Logging):
   Mencatat rumus visual & cara pakai komponen baru ke `hub/STYLE_LAB.md` dan `hub/RESULT.md`.
"""

import re

with open("hub/STYLE_LAB.md", "r", encoding="utf-8") as f:
    style_lab_text = f.read()

# Find the first PENDING module in hub/STYLE_LAB.md
match = re.search(r"\|\s*\*\*`(MOD-\d+)`\*\*\s*\|\s*`PENDING`\s*\|\s*([^|]+)\|\s*([^|]+)\|", style_lab_text)

if not match:
    log("Semua 12 modul di hub/STYLE_LAB.md sudah berstatus DONE!")
    print("ALL_MODULES_DONE")
else:
    mod_id = match.group(1).strip()
    mod_topic = match.group(2).strip()
    mod_target = match.group(3).strip()

    log(f"Memulai pembelajaran otomatis untuk {mod_id}: {mod_topic} -> Target: {mod_target}")

    phase(f"1. Riset & Bedah DNA Motion ({mod_id})")
    research_notes = await agent(
        prompt=(
            f"Kamu adalah Senior Motion Graphics Researcher.\n"
            f"Kita sedang mengerjakan modul pembelajaran `{mod_id}`:\n"
            f"- Topik Style: {mod_topic}\n"
            f"- Target Output: {mod_target}\n\n"
            "Tugasmu:\n"
            "1. Gunakan `search_web` atau baca referensi di `references/references_manifest.json` dan `.agent/skills/remotion-markup/SKILL.md` "
            "untuk membedah bagaimana motion designer profesional (Vox, Kurzgesagt, Apple, @motionformat, @getalgopicks, @wilingonten) "
            "menerapkan teknik ini.\n"
            "2. Rumuskan secara matematis & teknis bagaimana teknik ini dibuat di Remotion React/SVG pada 60fps "
            "(kurva bezier/spring, struktur layer SVG/CSS, palet warna, tipografi, dan koordinat Safe Zone 1080x1920).\n"
            "Kembalikan spesifikasi teknis lengkap untuk diserahkan ke Motion Engineer."
        ),
        schema={"type": "string"},
        role=f"Style Researcher ({mod_id})",
        model="flash"
    )
    log(f"Hasil riset {mod_id} selesai ({len(research_notes)} karakter).")

    phase(f"2. Implementasi Komponen Kode & Verifikasi TypeScript ({mod_id})")
    build_report = await agent(
        prompt=(
            f"Kamu adalah Lead Remotion Motion Graphic Engineer.\n"
            f"Kita sedang mengeksekusi `{mod_id}`:\n"
            f"- Topik Style: {mod_topic}\n"
            f"- Target Output: {mod_target}\n\n"
            f"Spesifikasi Hasil Riset:\n{research_notes}\n\n"
            "Tugas Eksekusi Wajib:\n"
            f"1. Bangun atau upgrade file target ({mod_target}) dengan kualitas produksi tinggi, mengikuti standar Safe Zone Reels (X: 80-920, Y: 140-1500) dan membaca token dari `src/projectLoader.ts` (`themeConfig`).\n"
            "2. Jika membuat komponen baru di `src/components/`, daftarkan juga komponen tersebut di `src/ReelsComposition.tsx` agar bisa langsung dipanggil dari `04_storyboard.json`.\n"
            "3. Jalankan `npx tsc --noEmit` menggunakan `run_command` dan pastikan Exit Code 0 (perbaiki jika ada error TypeScript).\n"
            f"4. Update `hub/STYLE_LAB.md`: ubah status `{mod_id}` di tabel dari `PENDING` menjadi `DONE`, dan tambahkan sub-bab catatan pembelajaran `{mod_id}` di bagian 'Jurnal Hasil Pembelajaran Overnight' berisi rumus animasi, alasan estetika, dan contoh JSON cara memakainya di `04_storyboard.json`.\n"
            "5. Update `hub/RESULT.md` dengan progres modul yang baru selesai."
        ),
        schema={"type": "string"},
        role=f"Motion Engineer ({mod_id})"
    )
    log(f"Implementasi {mod_id} selesai: {build_report}")
    print(build_report)
