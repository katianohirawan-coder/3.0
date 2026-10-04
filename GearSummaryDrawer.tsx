import React from 'react';
import { GearSlotType, GearPieceConfig, GEAR_SLOTS, GearPieceEvaluationResult } from '../types/gearEngine';

interface GearSummaryDrawerProps {
  enableGear: boolean;
  onToggleEnableGear: (enabled: boolean) => void;
  gearConfigs: Record<GearSlotType, GearPieceConfig>;
  evaluatedPieces: Record<GearSlotType, GearPieceEvaluationResult>;
  totalGearCp: number;
  totalStandaloneScore: number;
  characterSpeed: number;
  onUpdateGearLevel: (slot: GearSlotType, level: number) => void;
  onUpdateUpgradeLevel: (slot: GearSlotType, upgrade: number) => void;
  onUpdateGrade: (slot: GearSlotType, grade: any) => void;
  onOpenGearLab: () => void;
  onApplyMertillierGearPreset: () => void;
  onApplyHighEndGearPreset: () => void;
}

export const GearSummaryDrawer: React.FC<GearSummaryDrawerProps> = ({
  enableGear,
  onToggleEnableGear,
  evaluatedPieces,
  totalGearCp,
  totalStandaloneScore,
  characterSpeed,
  onUpdateGearLevel,
  onUpdateUpgradeLevel,
  onUpdateGrade,
  onOpenGearLab,
  onApplyMertillierGearPreset,
  onApplyHighEndGearPreset,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-4">
      {/* Header & Toggle Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-base">
            ⚙️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">
                Perlengkapan Gear (6 Slot)
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border transition-colors ${
                  enableGear
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {enableGear ? 'AKTIF DI KALKULATOR' : 'NON-AKTIF (BASE MURNI)'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Weapon, Helmet, Armor, Necklace, Gloves, Boots terhubung dengan akurasi 100%
            </div>
          </div>
        </div>

        {/* Master ON/OFF Switch */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {enableGear && (
            <div className="text-right hidden md:block">
              <span className="text-[10px] text-slate-400 block font-mono">Total Kenaikan CP:</span>
              <span className="text-xs font-bold text-amber-300 font-mono">
                +{totalGearCp.toLocaleString()} CP
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onToggleEnableGear(!enableGear)}
            className={`px-4 py-2 rounded-lg font-bold text-xs tracking-wider transition-all flex items-center gap-2 shadow-md ${
              enableGear
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-500/20'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
          >
            <span>{enableGear ? '✓' : '○'}</span>
            <span>{enableGear ? 'Gear Terpasang (ON)' : 'Pasang Gear (OFF)'}</span>
          </button>
        </div>
      </div>

      {/* Preset Buttons & Quick Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-slate-400 font-medium">Sampel Cepat Akun:</span>
          <button
            type="button"
            onClick={onApplyMertillierGearPreset}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-mono text-[11px] flex items-center gap-1 transition-colors"
            title="Muat Set 6 Quest Gear Lv 20 Tempa +20 (Mertillier User Benchmark: 8,421 CP)"
          >
            <span>🛡️</span>
            <span>Sampel Mertillier (Lv.20 Quest)</span>
          </button>
          <button
            type="button"
            onClick={onApplyHighEndGearPreset}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono text-[11px] flex items-center gap-1 transition-colors"
            title="Muat Set High-End Metatron LR & Satan SSR untuk karakter tingkat tinggi"
          >
            <span>✨</span>
            <span>Set High-End Metatron</span>
          </button>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-slate-400">
            Speed: <strong className="text-slate-200">{characterSpeed}</strong> ({(characterSpeed / 8000).toFixed(4)} CP/Pot)
          </span>
          <button
            type="button"
            onClick={onOpenGearLab}
            className="text-amber-400 hover:text-amber-300 underline font-semibold flex items-center gap-0.5"
          >
            <span>Buka Lab Lengkap</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* 6 Gear Slots Grid Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {GEAR_SLOTS.map((slot) => {
          const item = evaluatedPieces[slot.id];
          return (
            <div
              key={slot.id}
              className={`p-3 rounded-lg border transition-all ${
                enableGear
                  ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  : 'bg-slate-950/30 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{slot.icon}</span>
                  <div>
                    <div className="text-xs font-semibold text-slate-200 truncate max-w-[150px]">
                      {item.itemName}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {slot.name}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                      item.series.id === 'Normal' && item.questGradeInfo
                        ? item.questGradeInfo.badgeBg
                        : item.series.badgeBg
                    }`}
                  >
                    {item.series.id === 'Normal' && item.questGradeInfo
                      ? item.questGradeInfo.label
                      : item.series.rarity}
                  </span>
                </div>
              </div>

              {/* Stat & CP info */}
              <div className="flex items-center justify-between text-xs font-mono pt-1.5 border-t border-slate-800/60">
                <div className="text-slate-400 text-[11px]">
                  <span>{item.primaryStatName}: </span>
                  <strong className="text-slate-200">
                    {item.totalPrimaryStat.toLocaleString()}
                  </strong>
                  {item.actualUpgradeLevel > 0 && (
                    <span className="text-emerald-400 text-[10px] ml-1">
                      (+{item.actualUpgradeLevel})
                    </span>
                  )}
                </div>

                <div className="text-right font-bold text-amber-300">
                  +{item.characterCpContribution.toLocaleString()} CP
                </div>
              </div>

              {/* Sub-stats miniature tag */}
              {item.subStats && item.subStats.length > 0 && (
                <div className="mt-2 flex items-center justify-between text-[10px] font-mono bg-slate-900/60 px-2 py-1 rounded text-slate-400">
                  <div className="flex items-center gap-1.5 truncate">
                    {item.subStats.map((s, idx) => (
                      <span key={idx} className="text-slate-300">
                        {s.statName} +{s.value}
                      </span>
                    ))}
                  </div>
                  <span className="text-sky-400 shrink-0 font-semibold">
                    Spd +{item.speedCouplingCp}
                  </span>
                </div>
              )}

              {/* Augment & Reforge Mini Badges */}
              {(item.augment.totalAugmentCp > 0 || item.reforge.reforgeCp > 0) && (
                <div className="mt-1.5 flex items-center justify-between gap-1 text-[9px] font-mono">
                  {item.augment.totalAugmentCp > 0 ? (
                    <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 px-1.5 py-0.5 rounded truncate">
                      Augment: +{item.augment.totalAugmentCp.toLocaleString()} CP
                    </span>
                  ) : <span />}

                  {item.reforge.reforgeCp > 0 && (
                    <span className="bg-amber-950/80 text-amber-300 border border-amber-800/60 px-1.5 py-0.5 rounded shrink-0">
                      Reforge: +{item.reforge.reforgeCp.toLocaleString()} CP
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Rangkuman Dampak Gear ke Karakter */}
      {enableGear && (
        <div className="bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-900 p-3 rounded-lg border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold">💡 Catatan Sinkronisasi:</span>
            <span className="text-slate-300">
              Total <strong>+{totalGearCp.toLocaleString()} CP</strong> dari 6 gear langsung dimasukkan ke kartu CP utama di atas secara real-time.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px] self-end sm:self-auto shrink-0">
            <span className="text-slate-400">
              Skor Kartu Gear: <strong className="text-slate-200">{totalStandaloneScore.toLocaleString()}</strong>
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300 font-bold">
              Karakter CP: +{totalGearCp.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
