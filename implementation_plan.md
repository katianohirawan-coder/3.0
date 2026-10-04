# Rencana Implementasi: Modul Augment & Reforge Gear

## Ringkasan Fitur
Menambahkan dua sistem peningkatan gear lanjutan dari game *Memento Mori*:
1. **Augment (Magic Augment & Holy Augment):**
   - **Magic Augment (魔装):** Meningkatkan stat sekunder khusus sesuai slot peralatan (misal: P.DEF Break / DEF Break pada Senjata/Helmet, Critical / Accuracy, dll.) dengan konversi rate resmi ($\times 7.0$ untuk DEF Break, $\times 3.0$ untuk Crit).
   - **Holy Augment (聖装):** Meningkatkan stat primer utama gear (ATK, HP, DEF) atau persentase pengali tambahan.
2. **Reforge (Pengacakan & Penguncian 4 Potensial Dasar STR / DEX / MAG / STA):**
   - Slider dan input numerik manual per stat (STR, DEX, MAG, STA).
   - Fitur **Reforge Lock** (mengunci stat tertentu) dan tombol **"Reroll Reforge"**.
   - Input manual yang fleksibel agar pengguna bisa menyamakan persis dengan angka di layar HP.
3. **Preset Akun Sampel Nyata:**
   - Menyediakan preset gear dengan Augment & Reforge terpasang untuk memudahkan verifikasi instan.

---

## 1. Arsitektur Data (`src/types/gearEngine.ts`)
- Menambahkan field baru pada interface `GearPieceConfig`:
  ```ts
  export interface GearAugmentConfig {
    magicAugmentLevel: number; // 0 - 100
    holyAugmentLevel: number;  // 0 - 100
  }

  export interface GearReforgeConfig {
    str: number;
    dex: number;
    mag: number;
    sta: number;
    lockedStats: Array<'STR' | 'DEX' | 'MAG' | 'STA'>;
  }
  ```
- Menghitung kontribusi battle parameters dan CP dari:
  - Magic Augment:
    - Weapon: DEF Penetration / Physical DEF Break ($\times 7.0$ CP rate).
    - Gloves / Boots: Critical / HP / Evasion.
    - Helmet / Armor / Accessory: Debuff RES / Critical RES / P.DEF.
  - Holy Augment:
    - Tambahan flat parameter utama & scaling multiplier.
  - Reforge:
    - Nilai STR, DEX, MAG, STA gear dikonversikan ke ATK (sesuai Job), DEF, P.DEF, M.DEF, HP, dan Speed Coupling ($\text{SPD} / 8000$).

---

## 2. Pembaruan Antarmuka (`src/components/GearLabTab.tsx` & `src/components/GearSummaryDrawer.tsx`)
1. **Panel Augment (魔装・聖装):**
   - Kontrol slider level Magic Augment (0 - 40+) dan Holy Augment (0 - 40+).
   - Indikator stat yang didapat (misal: `+5,400 DEF Break (+37,800 CP)`).
2. **Panel Reforge (武具の精錬):**
   - Slider dan direct number input untuk STR, DEX, MAG, STA.
   - Tombol toggle gembok kunci (🔒 Lock) untuk simulasi reforge in-game.
   - Tombol "🎲 Reforge Roll (Acak)" yang mengocok ulang nilai yang tidak dikunci.
3. **Preset Cepat:**
   - Tombol "Muat Sampel Augment & Reforge Teruji".

---

## 3. Verifikasi & Pengujian
- Menjalankan `lint_applet` (`tsc --noEmit`) dan `compile_applet`.
- Menguji integrasi nilai CP yang mengalir ke kartu Hero utama secara real-time.
- Memperbarui arsip `.zip` mandiri di direktori publik.
