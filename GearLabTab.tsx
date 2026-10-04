import React, { useState, useMemo } from 'react';
import { CharacterEntry, RarityEntry } from '../types/memento';
import {
  GEAR_SLOTS,
  GearSlotType,
  GEAR_SERIES_LIST,
  GearSeries,
  GearPieceConfig,
  evaluateGearPiece,
  getCharRarityWeight,
  QUEST_GEAR_GRADES,
  QuestGearGrade,
} from '../types/gearEngine';

interface GearLabTabProps {
  currentCharacter: CharacterEntry;
  currentRarity: RarityEntry;
  characterLevel: number;
  gearConfigs?: Record<GearSlotType, GearPieceConfig>;
  onUpdateConfig?: (slot: GearSlotType, updates: Partial<GearPieceConfig>) => void;
  onSetAllConfigs?: (configs: Record<GearSlotType, GearPieceConfig>) => void;
}

export const GearLabTab: React.FC<GearLabTabProps> = ({
  currentCharacter,
  currentRarity,
  characterLevel,
  gearConfigs: controlledConfigs,
  onUpdateConfig: controlledUpdateConfig,
  onSetAllConfigs: controlledSetAllConfigs,
}) => {
  // Active selected slot tab (Weapon, Helmet, Armor, Necklace, Gloves, Boots)
  const [activeSlot, setActiveSlot] = useState<GearSlotType>('weapon');

  // Internal state fallback if not controlled
  const [internalConfigs, setInternalConfigs] = useState<Record<GearSlotType, GearPieceConfig>>({
    weapon: {
      seriesId: 'Normal',
      gearLevel: Math.min(characterLevel, 20),
      upgradeLevel: 0,
      isSignatureWeapon: false,
    },
    helmet: {
      seriesId: 'Normal',
      gearLevel: Math.min(characterLevel, 20),
      upgradeLevel: 0,
    },
    armor: {
      seriesId: 'Normal',
      gearLevel: Math.min(characterLevel, 20),
      upgradeLevel: 0,
    },
    necklace: {
      seriesId: 'Normal',
      gearLevel: Math.min(characterLevel, 20),
      upgradeLevel: 0,
    },
    gloves: {
      seriesId: 'Normal',
      gearLevel: Math.min(characterLevel, 20),
      upgradeLevel: 0,
    },
    boots: {
      seriesId: 'Normal',
      gearLevel: Math.min(characterLevel, 20),
      upgradeLevel: 0,
    },
  });

  const gearConfigs = controlledConfigs || internalConfigs;
  const setGearConfigs = controlledSetAllConfigs || setInternalConfigs;

  // Update specific slot configuration
  const handleUpdateConfig = (slot: GearSlotType, updates: Partial<GearPieceConfig>) => {
    if (controlledUpdateConfig) {
      controlledUpdateConfig(slot, updates);
    } else {
      setInternalConfigs((prev) => ({
        ...prev,
        [slot]: {
          ...prev[slot],
          ...updates,
        },
      }));
    }
  };

  // Evaluate all 6 pieces
  const evaluatedPieces = useMemo(() => {
    const map: Record<GearSlotType, ReturnType<typeof evaluateGearPiece>> = {} as any;
    GEAR_SLOTS.forEach((slot) => {
      map[slot.id] = evaluateGearPiece({
        slot: slot.id,
        config: gearConfigs[slot.id],
        charLevel: characterLevel,
        charRarityLabel: currentRarity.label,
        charJob: currentCharacter.job,
        charName: currentCharacter.nameEn,
        charSpeed: currentCharacter.baseSpeed,
      });
    });
    return map;
  }, [gearConfigs, characterLevel, currentRarity, currentCharacter]);

  // Current active piece evaluation
  const activePiece = evaluatedPieces[activeSlot];

  // Total Lab CP from all 6 gear pieces (Real Character CP Gain)
  const totalLabCp = useMemo(() => {
    return Object.values(evaluatedPieces).reduce((sum, p) => sum + p.characterCpContribution, 0);
  }, [evaluatedPieces]);

  // Total Standalone Gear Score (Power displayed on item cards)
  const totalStandaloneScore = useMemo(() => {
    return Object.values(evaluatedPieces).reduce((sum, p) => sum + p.standaloneGearCardPower, 0);
  }, [evaluatedPieces]);

  // Reset to initial low/clean state
  const handleResetToBasic = () => {
    const baseLvl = Math.min(characterLevel, 20);
    const resetState: Record<GearSlotType, GearPieceConfig> = {} as any;
    GEAR_SLOTS.forEach((slot) => {
      resetState[slot.id] = {
        seriesId: 'Normal',
        gearLevel: baseLvl,
        upgradeLevel: 0,
        isSignatureWeapon: false,
      };
    });
    setGearConfigs(resetState);
  };

  const charWeight = getCharRarityWeight(currentRarity.label);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-bold">
                LAB 6 SLOT GEAR (TERISOLASI)
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Job: {currentCharacter.job} | Quest Cap Lv 180 | Signature Toggle SSR/UR/LR
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>⚙️</span>
              <span>Laboratorium Simulasi 6 Bagian Gear</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Eksplorasi seluruh 6 perlengkapan: <strong>Weapon, Helmet, Armor, Necklace, Gloves, Boots</strong>.
              Level gear dibatasi maksimal pada <strong>Level Karakter (Lv {characterLevel})</strong> dan Quest Gear mentok pada <strong>Lv 180</strong>. Jika syarat level atau kasta tidak terpenuhi, nilai stat & CP otomatis <strong>0</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetToBasic}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg border border-slate-700 transition-colors shadow-sm flex items-center gap-1.5 shrink-0"
            >
              <span>↺</span>
              <span>Reset ke Gear Awal (Normal Lv 20)</span>
            </button>
          </div>
        </div>

        {/* Character Context Bar */}
        <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 flex-wrap text-slate-400">
            <span>Karakter: <strong className="text-slate-100">{currentCharacter.nameEn}</strong></span>
            <span>&bull;</span>
            <span>Job: <strong className="text-sky-300">{currentCharacter.job}</strong></span>
            <span>&bull;</span>
            <span>Kasta: <strong className="text-amber-300">{currentRarity.label}</strong></span>
            <span>&bull;</span>
            <span>Level: <strong className="text-emerald-400">Lv {characterLevel}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
              <span className="text-slate-400 text-xs">Total Skor Kartu:</span>
              <span className="text-sm font-bold text-slate-300 font-mono">
                {Math.floor(totalStandaloneScore).toLocaleString()}
              </span>
            </div>

            <div className="bg-gradient-to-r from-amber-950/60 to-slate-950 px-3 py-1.5 rounded-lg border border-amber-500/50 flex items-center gap-2 shadow-sm">
              <span className="text-amber-400 text-xs font-semibold">Total Kenaikan CP Karakter:</span>
              <span className="text-base font-extrabold text-amber-300 font-mono">
                +{Math.floor(totalLabCp).toLocaleString()} CP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 6 Gear Slots Navigation Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {GEAR_SLOTS.map((slot) => {
          const evalItem = evaluatedPieces[slot.id];
          const isActive = activeSlot === slot.id;

          return (
            <button
              key={slot.id}
              onClick={() => setActiveSlot(slot.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-amber-500/20 border-amber-500/80 shadow-md ring-1 ring-amber-500/40'
                  : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-lg">{slot.icon}</span>
                <span
                  className={`text-[9px] px-1 rounded font-mono font-bold border ${
                    evalItem.isEligible
                      ? 'bg-slate-950 text-slate-300 border-slate-700'
                      : 'bg-rose-950 text-rose-400 border-rose-800'
                  }`}
                >
                  {evalItem.isEligible ? evalItem.series.rarity : 'LOCKED'}
                </span>
              </div>

              <div className="mt-2">
                <div className="text-xs font-bold text-slate-200 truncate">{slot.name.split(' ')[0]}</div>
                <div className="text-[10px] text-slate-400 truncate mt-0.5 font-mono">
                  {evalItem.isEligible ? `Lv ${evalItem.actualGearLevel} (+${evalItem.actualUpgradeLevel})` : '0 CP'}
                </div>
              </div>

              <div className="mt-2 pt-1 border-t border-slate-800/80 text-[10px] font-mono text-amber-300 font-semibold truncate flex items-center justify-between">
                <span>{evalItem.isEligible ? `+${Math.floor(evalItem.characterCpContribution).toLocaleString()}` : '0 CP'}</span>
                <span className="text-[9px] text-slate-500">CP</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Slot Detailed Editor & Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Configuration Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card 1: Rarity / Series Selector */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Pilih Kasta Seri ({activePiece.slot.name.split(' ')[0]})
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                {activePiece.series.name}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {GEAR_SERIES_LIST.map((s) => {
                const isSelected = gearConfigs[activeSlot].seriesId === s.id;
                const isLockedRarity = charWeight < s.minCharRarityWeight;
                const isLockedLevel = s.minGearLevel > characterLevel;
                const isLocked = isLockedRarity || isLockedLevel;

                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      const maxAllowed = s.id === 'Normal' ? Math.min(characterLevel, 180) : characterLevel;
                      const nextLvl = Math.min(maxAllowed, Math.max(s.minGearLevel, gearConfigs[activeSlot].gearLevel));
                      handleUpdateConfig(activeSlot, {
                        seriesId: s.id,
                        gearLevel: nextLvl,
                        upgradeLevel: Math.min(nextLvl, gearConfigs[activeSlot].upgradeLevel),
                      });
                    }}
                    className={`p-2.5 rounded-lg border text-left transition-all relative ${
                      isSelected
                        ? isLocked
                          ? 'bg-rose-950/30 border-rose-500/80 text-rose-300 shadow-sm'
                          : 'bg-amber-500/20 border-amber-500/80 text-amber-200 shadow-sm'
                        : isLocked
                        ? 'bg-slate-950/80 border-slate-800 text-slate-500 hover:border-slate-700 opacity-60'
                        : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{s.rarity}</span>
                      {isLockedRarity ? (
                        <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-800 px-1 rounded font-mono">
                          🔒 {s.requiresCharLR5 ? 'LR+5' : s.rarity}
                        </span>
                      ) : isLockedLevel ? (
                        <span className="text-[9px] bg-rose-950 text-rose-400 border border-rose-800 px-1 rounded font-mono">
                          🔒 Lv {s.minGearLevel}+
                        </span>
                      ) : null}
                    </div>
                    <div className="text-xs truncate font-medium mt-0.5">{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      {s.id === 'Normal' ? 'Maks Lv 180' : `Min Lv ${s.minGearLevel}`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quest Gear Sub-Grade Selector (D, C, B, A, S) - Only for Quest Gear! */}
            {activePiece.series.id === 'Normal' && (
              <div className="pt-2 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">
                    Sub-Grade Quest Gear (D &bull; C &bull; B &bull; A &bull; S &bull; S+):
                  </span>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">
                    Grade {gearConfigs[activeSlot].questGrade || 'A'} ({QUEST_GEAR_GRADES[gearConfigs[activeSlot].questGrade || 'A'].bonusSubStatsCount} Sub-Stats)
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {(['D', 'C', 'B', 'A', 'S', 'S+'] as QuestGearGrade[]).map((grd) => {
                    const info = QUEST_GEAR_GRADES[grd];
                    const isSelected = (gearConfigs[activeSlot].questGrade || 'A') === grd;

                    return (
                      <button
                        key={grd}
                        onClick={() => handleUpdateConfig(activeSlot, { questGrade: grd })}
                        className={`py-2 px-1 rounded-lg border text-center transition-all ${
                          isSelected
                            ? 'bg-amber-500/25 border-amber-500 text-amber-200 font-bold shadow-sm ring-1 ring-amber-500/40'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-mono font-extrabold">{grd}</div>
                        <div className="text-[9px] text-slate-400 mt-0.5 font-mono">
                          {info.bonusSubStatsCount} Stat
                        </div>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between">
                  <span>D: 0 sub</span>
                  <span>C: 1 sub</span>
                  <span>B: 2 sub</span>
                  <span>A: 3 sub</span>
                  <span>S: 4 sub</span>
                  <span className="text-rose-400 font-bold">S+: +10% Stat</span>
                </div>
              </div>
            )}

            {/* Signature Weapon Toggle (Khusus Weapon di kasta SSR, UR, LR) */}
            {activeSlot === 'weapon' && (activePiece.series.id === 'Satan' || activePiece.series.id === 'Michael' || activePiece.series.id === 'Metatron') && (
              <div className="pt-2 border-t border-slate-800/80">
                <div className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Pilihan Jenis Senjata ({activePiece.series.rarity}):</span>
                  <span className="text-[10px] font-mono text-amber-400">
                    {gearConfigs.weapon.isSignatureWeapon ? 'Dedicated / Signature' : 'Standard Weapon'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateConfig('weapon', { isSignatureWeapon: true })}
                    className={`p-2 rounded-lg border text-left text-xs transition-all ${
                      gearConfigs.weapon.isSignatureWeapon
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold">✨ Signature Dedicated</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {activePiece.itemName.split('(')[0]}
                    </div>
                  </button>
                  <button
                    onClick={() => handleUpdateConfig('weapon', { isSignatureWeapon: false })}
                    className={`p-2 rounded-lg border text-left text-xs transition-all ${
                      !gearConfigs.weapon.isSignatureWeapon
                        ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[11px] font-bold">⚔️ Standard Weapon</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      Senjata seri standar non-signature
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Ineligibility Warning Alert */}
            {!activePiece.isEligible && (
              <div className="p-3 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2 shadow-inner">
                <span className="text-rose-400 text-base">🚫</span>
                <div>
                  <div className="font-bold text-rose-300">Gear Terkunci (Stat & CP = 0)</div>
                  <div className="mt-0.5 text-slate-300">{activePiece.ineligibilityReason}</div>
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Gear Level & Upgrade Level */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                2. Input Level Gear & Upgrade
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Batas Karakter: Lv {characterLevel}
              </span>
            </div>

            {/* Gear Level Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label className="text-slate-400">Level Gear:</label>
                <span className="font-mono text-amber-300 font-bold">
                  Lv {gearConfigs[activeSlot].gearLevel} / Maks {activePiece.maxGearLevelAllowed}
                </span>
              </div>
              <input
                type="number"
                min={1}
                max={activePiece.maxGearLevelAllowed}
                value={gearConfigs[activeSlot].gearLevel}
                onChange={(e) => {
                  const val = Number(e.target.value) || 1;
                  const clamped = Math.max(1, Math.min(activePiece.maxGearLevelAllowed, val));
                  handleUpdateConfig(activeSlot, {
                    gearLevel: clamped,
                    upgradeLevel: Math.min(clamped, gearConfigs[activeSlot].upgradeLevel),
                  });
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:border-amber-500"
              />

              {/* Preset buttons */}
              <div className="flex items-center gap-1.5 pt-1 flex-wrap">
                <span className="text-[10px] text-slate-500 font-mono">Preset:</span>
                {[20, 60, 100, 140, 180, 240, 270, 300, 320, 330, 340]
                  .filter((lvl) => lvl <= activePiece.maxGearLevelAllowed)
                  .map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() =>
                        handleUpdateConfig(activeSlot, {
                          gearLevel: lvl,
                          upgradeLevel: Math.min(lvl, gearConfigs[activeSlot].upgradeLevel),
                        })
                      }
                      className={`px-2 py-0.5 text-[10px] font-mono rounded border transition-colors ${
                        gearConfigs[activeSlot].gearLevel === lvl
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
              </div>
            </div>

            {/* Upgrade Level Input & Slider */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <label className="text-slate-300 font-semibold">Upgrade Level (Tempa):</label>
                  {gearConfigs[activeSlot].upgradeLevel === gearConfigs[activeSlot].gearLevel &&
                    activePiece.isEligible && (
                      <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1 rounded font-mono">
                        MAX
                      </span>
                    )}
                </div>
                <span className="font-mono text-amber-400 font-bold">
                  +{activePiece.actualUpgradeLevel} / {activePiece.maxUpgradeLevel}
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={Math.max(1, gearConfigs[activeSlot].gearLevel)}
                disabled={!activePiece.isEligible}
                value={activePiece.actualUpgradeLevel}
                onChange={(e) =>
                  handleUpdateConfig(activeSlot, { upgradeLevel: Number(e.target.value) })
                }
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              />

              <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <button
                  onClick={() => handleUpdateConfig(activeSlot, { upgradeLevel: 0 })}
                  className="text-slate-400 hover:text-slate-300"
                >
                  +0 (Tanpa Tempa)
                </button>
                <button
                  disabled={!activePiece.isEligible}
                  onClick={() =>
                    handleUpdateConfig(activeSlot, { upgradeLevel: gearConfigs[activeSlot].gearLevel })
                  }
                  className="text-amber-400 hover:text-amber-300 underline disabled:opacity-30 disabled:no-underline"
                >
                  Maksimalkan (+{gearConfigs[activeSlot].gearLevel})
                </button>
              </div>
            </div>
          </div>

          {/* Card 3: Augment System (Magic Augment 魔装 & Holy Augment 聖装) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>✨ 3. Augment Gear</span>
                <span className="text-[10px] text-amber-400 font-mono font-normal">(魔装・聖装)</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                +{activePiece.augment.totalAugmentCp.toLocaleString()} CP
              </span>
            </div>

            {/* Magic Augment (魔装) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-300 font-semibold">Magic Augment (魔装):</span>
                  <span className="text-[10px] text-slate-400 font-mono">{activePiece.augment.magicStatName}</span>
                </div>
                <span className="font-mono text-purple-300 font-bold">
                  Lv {gearConfigs[activeSlot].augment?.magicAugmentLevel || 0} / 40
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={40}
                value={gearConfigs[activeSlot].augment?.magicAugmentLevel || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  handleUpdateConfig(activeSlot, {
                    augment: {
                      magicAugmentLevel: val,
                      holyAugmentLevel: gearConfigs[activeSlot].augment?.holyAugmentLevel || 0,
                    },
                  });
                }}
                className="w-full accent-purple-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                <span>Stat: <strong className="text-purple-300">+{activePiece.augment.magicStatValue.toLocaleString()}</strong></span>
                <span className="text-purple-400 font-bold">+{activePiece.augment.magicCp.toLocaleString()} CP</span>
              </div>
            </div>

            {/* Holy Augment (聖装) */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-amber-300 font-semibold">Holy Augment (聖装):</span>
                  <span className="text-[10px] text-slate-400 font-mono">{activePiece.augment.holyStatName}</span>
                </div>
                <span className="font-mono text-amber-300 font-bold">
                  Lv {gearConfigs[activeSlot].augment?.holyAugmentLevel || 0} / 40
                </span>
              </div>

              <input
                type="range"
                min={0}
                max={40}
                value={gearConfigs[activeSlot].augment?.holyAugmentLevel || 0}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  handleUpdateConfig(activeSlot, {
                    augment: {
                      magicAugmentLevel: gearConfigs[activeSlot].augment?.magicAugmentLevel || 0,
                      holyAugmentLevel: val,
                    },
                  });
                }}
                className="w-full accent-amber-500 h-1.5 bg-slate-950 rounded-lg cursor-pointer"
              />

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/80">
                <span>Stat: <strong className="text-amber-300">+{activePiece.augment.holyStatValue.toFixed(1)}%</strong></span>
                <span className="text-amber-400 font-bold">+{activePiece.augment.holyCp.toLocaleString()} CP</span>
              </div>
            </div>
          </div>

          {/* Card 4: Reforge System (武具の精錬 - STR, DEX, MAG, STA) */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <span>⚒️ 4. Reforge (精錬)</span>
                <span className="text-[10px] text-slate-400 font-mono font-normal">4 Potensial Dasar</span>
              </span>
              <span className="text-[11px] font-mono text-amber-400 font-bold">
                +{activePiece.reforge.reforgeCp.toLocaleString()} CP
              </span>
            </div>

            {/* Quick Roll and Lock Controls */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 text-[11px]">
                Total Reforge:{' '}
                <strong className="text-slate-200 font-mono">
                  {activePiece.reforge.totalReforgePoints.toLocaleString()}
                </strong>{' '}
                <span className="text-slate-400 font-mono">
                  / {activePiece.reforge.maxReforgePool.toLocaleString()} (Pool Cap Resmi)
                </span>
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    // Reforge roll: randomizes unlocked stats while strictly using official maxReforgePool
                    const cur = gearConfigs[activeSlot].reforge || { str: 0, dex: 0, mag: 0, sta: 0, lockedStats: [] };
                    const locked = cur.lockedStats || [];
                    const baseReforgePool = activePiece.reforge.maxReforgePool || 100;
                    
                    const keys: Array<'str' | 'dex' | 'mag' | 'sta'> = ['str', 'dex', 'mag', 'sta'];
                    const unlockedKeys = keys.filter(k => !locked.includes(k.toUpperCase() as any));
                    
                    if (unlockedKeys.length === 0) return;
                    
                    let remaining = baseReforgePool;
                    keys.forEach(k => {
                      if (locked.includes(k.toUpperCase() as any)) {
                        remaining = Math.max(0, remaining - (cur[k] || 0));
                      }
                    });

                    const cuts = [0, ...Array(unlockedKeys.length - 1).fill(0).map(() => Math.floor(Math.random() * remaining)).sort((a, b) => a - b), remaining];
                    const nextReforge = { ...cur };
                    
                    unlockedKeys.forEach((k, idx) => {
                      nextReforge[k] = cuts[idx + 1] - cuts[idx];
                    });

                    handleUpdateConfig(activeSlot, { reforge: nextReforge });
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono text-[11px] flex items-center gap-1 transition-colors"
                >
                  <span>🎲</span>
                  <span>Reforge Roll</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleUpdateConfig(activeSlot, {
                      reforge: { str: 0, dex: 0, mag: 0, sta: 0, lockedStats: [] },
                    });
                  }}
                  className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 font-mono text-[11px] transition-colors"
                  title="Kosongkan nilai Reforge"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* 4 Stat Sliders & Direct Number Inputs */}
            {(['STR', 'DEX', 'MAG', 'STA'] as const).map((statKey) => {
              const lowerKey = statKey.toLowerCase() as 'str' | 'dex' | 'mag' | 'sta';
              const curReforge = gearConfigs[activeSlot].reforge || { str: 0, dex: 0, mag: 0, sta: 0, lockedStats: [] };
              const currentVal = curReforge[lowerKey] || 0;
              const isLocked = curReforge.lockedStats?.includes(statKey) || false;

              const isJobMain =
                (currentCharacter.job === 'Warrior' && statKey === 'STR') ||
                (currentCharacter.job === 'Sniper' && statKey === 'DEX') ||
                (currentCharacter.job === 'Sorcerer' && statKey === 'MAG');

              const sliderMax = Math.max(100, activePiece.reforge.maxReforgePool);

              return (
                <div key={statKey} className="space-y-1 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          const existingLocked = curReforge.lockedStats || [];
                          const nextLocked = isLocked
                            ? existingLocked.filter((s) => s !== statKey)
                            : [...existingLocked, statKey];
                          handleUpdateConfig(activeSlot, {
                            reforge: { ...curReforge, lockedStats: nextLocked },
                          });
                        }}
                        className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${
                          isLocked
                            ? 'bg-rose-950/80 text-rose-300 border-rose-800 font-bold'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                        title={isLocked ? 'Stat dikunci (tidak teracak saat roll)' : 'Klik untuk mengunci stat'}
                      >
                        {isLocked ? '🔒 Lock' : '🔓'}
                      </button>

                      <span className={`font-semibold ${
                        statKey === 'STR' ? 'text-rose-300' :
                        statKey === 'DEX' ? 'text-emerald-300' :
                        statKey === 'MAG' ? 'text-sky-300' : 'text-amber-300'
                      }`}>
                        {statKey}
                      </span>
                      {isJobMain && (
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1 rounded font-mono">
                          JOB MAIN (+4 CP)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="99999"
                        value={currentVal}
                        onChange={(e) => {
                          const val = Math.max(0, parseInt(e.target.value) || 0);
                          handleUpdateConfig(activeSlot, {
                            reforge: { ...curReforge, [lowerKey]: val },
                          });
                        }}
                        className="w-20 bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-right font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <input
                    type="range"
                    min={0}
                    max={sliderMax}
                    value={currentVal}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      handleUpdateConfig(activeSlot, {
                        reforge: { ...curReforge, [lowerKey]: val },
                      });
                    }}
                    className="w-full accent-amber-500 h-1 bg-slate-900 rounded cursor-pointer"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Piece Display Card & Stat Results (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div
            className={`border rounded-xl p-5 shadow-xl relative overflow-hidden space-y-4 transition-all ${
              activePiece.isEligible
                ? 'bg-[#121B2D] border-amber-500/30'
                : 'bg-slate-950/90 border-rose-900/50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                {/* Gear Icon Mockup */}
                <div
                  className={`w-12 h-12 rounded-lg border flex items-center justify-center text-xl relative shrink-0 shadow-inner ${
                    activePiece.isEligible
                      ? 'bg-slate-950 border-amber-500/40 text-amber-300'
                      : 'bg-slate-900 border-rose-800/40 text-slate-600'
                  }`}
                >
                  <span>{activePiece.isEligible ? activePiece.slot.icon : '🔒'}</span>
                  {activePiece.isEligible && (
                    <span className="absolute -bottom-1 -right-1 text-[9px] bg-amber-500 text-slate-950 font-mono font-bold px-1 rounded">
                      +{activePiece.actualUpgradeLevel}
                    </span>
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.2 rounded border ${
                        activePiece.isEligible
                          ? 'bg-amber-950 text-amber-300 border-amber-700'
                          : 'bg-slate-800 text-slate-500 border-slate-700'
                      }`}
                    >
                      {activePiece.series.rarity}
                    </span>
                    {activePiece.series.id === 'Normal' && activePiece.questGradeInfo && (
                      <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${activePiece.questGradeInfo.badgeBg}`}>
                        {activePiece.questGradeInfo.label}
                      </span>
                    )}
                    <h3 className="text-base font-bold text-slate-100">
                      {activePiece.itemName}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {activePiece.slot.name} &bull; {activePiece.series.name} &bull; Gear Lv {gearConfigs[activeSlot].gearLevel}
                    {activePiece.series.id === 'Normal' && activePiece.questGradeInfo && (
                      <span className="text-slate-500 ml-1.5">
                        ({activePiece.questGradeInfo.bonusSubStatsCount} Bonus Sub-Stat)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Dual Combat Power Display: Real Character Gain & Standalone Card Power */}
              <div className="flex items-center gap-3">
                <div
                  className={`px-3 py-1.5 rounded-xl border text-right shrink-0 ${
                    activePiece.isEligible
                      ? 'bg-slate-950/80 border-slate-800'
                      : 'bg-rose-950/40 border-rose-900/60'
                  }`}
                >
                  <div className="text-[9px] text-slate-400 font-mono uppercase tracking-wider">
                    Total Power Kartu
                  </div>
                  <div
                    className={`text-base font-bold font-mono tabular-nums ${
                      activePiece.isEligible ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    {Math.floor(activePiece.standaloneGearCardPower).toLocaleString()}
                  </div>
                </div>

                <div
                  className={`px-4 py-2 rounded-xl border text-right shrink-0 shadow-lg ${
                    activePiece.isEligible
                      ? 'bg-gradient-to-br from-amber-950/50 to-slate-950 border-amber-500/60'
                      : 'bg-rose-950/40 border-rose-900/60'
                  }`}
                >
                  <div className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                    Kenaikan CP Karakter
                  </div>
                  <div
                    className={`text-2xl font-extrabold font-mono tabular-nums ${
                      activePiece.isEligible ? 'text-amber-300' : 'text-slate-500'
                    }`}
                  >
                    +{Math.floor(activePiece.characterCpContribution).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* In-game Attribute Display */}
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 pb-2">
                <span className="font-semibold uppercase tracking-wider text-slate-300">
                  Parameter Statistik Utama ({activePiece.primaryStatName})
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    activePiece.isEligible ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {activePiece.isEligible
                    ? `Upgrade: +${activePiece.actualUpgradeLevel} / ${activePiece.maxUpgradeLevel}`
                    : 'STATUS: TERKUNCI (0 STAT)'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm font-mono py-1">
                <span className="text-slate-300 font-medium">{activePiece.primaryStatName} Dasar + Tempa:</span>
                <span
                  className={`text-xl font-bold tabular-nums ${
                    activePiece.isEligible ? 'text-amber-300' : 'text-slate-500'
                  }`}
                >
                  {activePiece.totalPrimaryStat.toLocaleString()}
                </span>
              </div>

              {/* Breakdown of Base vs Upgrade */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">
                    Base {activePiece.primaryStatName} (Lv {gearConfigs[activeSlot].gearLevel}):
                  </span>
                  <span className="text-slate-200 font-semibold">
                    {activePiece.baseStat.toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">
                    Dari Upgrade (+{activePiece.actualUpgradeLevel}):
                  </span>
                  <span className="text-emerald-400 font-semibold">
                    +{activePiece.statFromUpgrade.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Bonus Effect (Sub-stats) Display matching screenshot! */}
              {activePiece.isEligible && activePiece.subStats && activePiece.subStats.length > 0 && (
                <div className="pt-2.5 border-t border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>Bonus Effect (Sub-Stat):</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Total: {activePiece.subStats.reduce((sum, s) => sum + s.value, 0)} Poin)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          // Simulate an authentic in-game RNG re-roll preserving total points
                          const total = activePiece.subStats.reduce((sum, s) => sum + s.value, 0);
                          const count = activePiece.subStats.length;
                          const statsPool = ['STR', 'MAG', 'DEX', 'STA'];
                          // Pick random distinct stats
                          const shuffled = [...statsPool].sort(() => Math.random() - 0.5).slice(0, count);
                          // Distribute total points randomly
                          const cuts = [0, ...Array(count - 1).fill(0).map(() => Math.floor(Math.random() * (total - count * 5)) + 5).sort((a, b) => a - b), total];
                          const newSubStats = shuffled.map((name, i) => ({
                            statName: name,
                            value: Math.max(5, cuts[i + 1] - cuts[i]),
                          }));
                          handleUpdateConfig(activeSlot, { customSubStats: newSubStats });
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-mono flex items-center gap-1"
                        title="Acak pembagian sub-stat seperti roll tempa di dalam game"
                      >
                        <span>🎲</span>
                        <span>Roll Acak (RNG)</span>
                      </button>
                      {gearConfigs[activeSlot].customSubStats && (
                        <button
                          type="button"
                          onClick={() => {
                            handleUpdateConfig(activeSlot, { customSubStats: undefined });
                          }}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 font-mono"
                          title="Kembalikan ke distribusi default job"
                        >
                          ↺ Reset
                        </button>
                      )}
                      <div className="flex items-center gap-1.5 font-mono text-[10px]">
                        <span className="text-sky-400 bg-sky-950/60 px-1.5 py-0.5 rounded border border-sky-800/60">
                          +Speed CP: +{activePiece.speedCouplingCp}
                        </span>
                        <span className="text-amber-300 font-bold">
                          +{activePiece.bonusEffectCp} Skor
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-xs">
                    {activePiece.subStats.map((sub, idx) => (
                      <div key={idx} className="bg-slate-900/80 px-2 py-1.5 rounded border border-slate-800 flex items-center justify-between">
                        <select
                          value={sub.statName}
                          onChange={(e) => {
                            const newStats = activePiece.subStats.map((s, i) =>
                              i === idx ? { ...s, statName: e.target.value } : s
                            );
                            handleUpdateConfig(activeSlot, { customSubStats: newStats });
                          }}
                          className="bg-transparent text-slate-300 font-semibold text-xs focus:outline-none cursor-pointer"
                        >
                          <option value="STR" className="bg-slate-900 text-slate-200">STR</option>
                          <option value="DEX" className="bg-slate-900 text-slate-200">DEX</option>
                          <option value="MAG" className="bg-slate-900 text-slate-200">MAG</option>
                          <option value="STA" className="bg-slate-900 text-slate-200">STA</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <span className="text-amber-400/80 font-bold">+</span>
                          <input
                            type="number"
                            min="0"
                            max="999"
                            value={sub.value}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value) || 0);
                              const newStats = activePiece.subStats.map((s, i) =>
                                i === idx ? { ...s, value: val } : s
                              );
                              handleUpdateConfig(activeSlot, { customSubStats: newStats });
                            }}
                            className="w-12 bg-slate-950/80 text-amber-300 font-bold text-xs text-right px-1 py-0.5 rounded border border-slate-700/60 focus:outline-none focus:border-amber-500"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-500 italic">
                    💡 Tip: Anda bisa mengklik nama stat atau mengetikkan angka riil dari gear in-game Anda agar CP 100% presisi dengan layar game Anda!
                  </div>
                </div>
              )}

              {/* Augment (魔装・聖装) Results Box */}
              {(activePiece.augment.magicLevel > 0 || activePiece.augment.holyLevel > 0) && (
                <div className="pt-2.5 border-t border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="text-purple-300 font-bold">✨ Augment Status:</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Magic Lv {activePiece.augment.magicLevel} &bull; Holy Lv {activePiece.augment.holyLevel})
                      </span>
                    </span>
                    <span className="text-emerald-400 font-mono font-bold text-xs">
                      +{activePiece.augment.totalAugmentCp.toLocaleString()} CP
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-purple-950/30 p-2 rounded border border-purple-800/50">
                      <span className="text-[10px] text-purple-300 block font-semibold truncate">
                        {activePiece.augment.magicStatName}:
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-slate-200">+{activePiece.augment.magicStatValue.toLocaleString()}</span>
                        <span className="text-purple-400 font-semibold text-[11px]">+{activePiece.augment.magicCp.toLocaleString()} CP</span>
                      </div>
                    </div>

                    <div className="bg-amber-950/30 p-2 rounded border border-amber-800/50">
                      <span className="text-[10px] text-amber-300 block font-semibold truncate">
                        {activePiece.augment.holyStatName}:
                      </span>
                      <div className="flex items-center justify-between mt-0.5">
                        <span className="text-slate-200">+{activePiece.augment.holyStatValue.toLocaleString()}</span>
                        <span className="text-amber-400 font-semibold text-[11px]">+{activePiece.augment.holyCp.toLocaleString()} CP</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reforge (精錬) Results Box */}
              {activePiece.reforge.totalReforgePoints > 0 && (
                <div className="pt-2.5 border-t border-slate-800/60 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <span className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold">⚒️ Reforge Status:</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        (Total: {activePiece.reforge.totalReforgePoints.toLocaleString()} Poin)
                      </span>
                    </span>
                    <span className="text-amber-400 font-mono font-bold text-xs">
                      +{activePiece.reforge.reforgeCp.toLocaleString()} CP
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 text-xs font-mono text-center">
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-[10px] text-rose-300 block">STR</span>
                      <span className="text-slate-200 font-bold">+{activePiece.reforge.str}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-[10px] text-emerald-300 block">DEX</span>
                      <span className="text-slate-200 font-bold">+{activePiece.reforge.dex}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-[10px] text-sky-300 block">MAG</span>
                      <span className="text-slate-200 font-bold">+{activePiece.reforge.mag}</span>
                    </div>
                    <div className="bg-slate-900/80 p-1.5 rounded border border-slate-800">
                      <span className="text-[10px] text-amber-300 block">STA</span>
                      <span className="text-slate-200 font-bold">+{activePiece.reforge.sta}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between">
                    <span>Speed Coupling dari Reforge:</span>
                    <span className="text-sky-400 font-semibold">+{activePiece.reforge.speedCouplingCp} CP</span>
                  </div>
                </div>
              )}
            </div>

            {/* Status Feedback Note */}
            <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-3 flex items-start gap-2">
              <span className="text-amber-400">ℹ</span>
              <div>
                {activePiece.isEligible ? (
                  <span>
                    <strong>Status Komponen:</strong> Perlengkapan ini aktif. Konversi resmi CP untuk slot {activePiece.slot.name.split(' ')[0]} adalah{' '}
                    <strong className="text-amber-300 font-mono">
                      {activePiece.primaryStatName} &times; {activePiece.slot.cpRate === 7 / 3 ? '2.33 (7/3)' : activePiece.slot.cpRate}
                    </strong>.
                  </span>
                ) : (
                  <span className="text-rose-300">
                    <strong>Pemberitahuan Sistem Game:</strong> {activePiece.ineligibilityReason}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
