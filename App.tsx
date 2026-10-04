import React, { useState, useMemo } from 'react';
import {
  CHARACTERS,
  CharacterEntry,
  RarityEntry,
  ElementId,
  JobType,
  getRaritiesForCharacter,
} from './types/memento';
import {
  calculateCharacterStats,
  RoundingMethod,
} from './types/statEngine';
import { ArcanaSelectionMap, ArcanaTierKey } from './types/arcana';
import {
  ARCANA_CATALOG,
  calculateArcanaModifiersForCharacter,
} from './utils/arcanaCalculator';
import { CharacterSelector } from './components/CharacterSelector';
import { ConfigurationPanel } from './components/ConfigurationPanel';
import { StatOverviewHero } from './components/StatOverviewHero';
import { CpBreakdownPage } from './components/CpBreakdownPage';
import { ArcanaChecklistDrawer } from './components/ArcanaChecklistDrawer';
import { ArcanaCatalogTab } from './components/ArcanaCatalogTab';
import { MasterVerificationReference } from './components/MasterVerificationReference';
import { GearLabTab } from './components/GearLabTab';
import { GearSummaryDrawer } from './components/GearSummaryDrawer';
import {
  GearSlotType,
  GearPieceConfig,
  GEAR_SLOTS,
  evaluateGearPiece,
} from './types/gearEngine';

export default function App() {
  // 1. Core State
  // Default to Florence (matching user's verified benchmark)
  const defaultChar = useMemo(() => {
    return (
      CHARACTERS.find((c) => c.nameEn === 'Florence' || c.nameJp === 'フローレンス') ||
      CHARACTERS[0]
    );
  }, []);

  const [selectedChar, setSelectedChar] = useState<CharacterEntry>(defaultChar);

  // Initialize rarity from character's own base table (LR3 for Florence benchmark)
  const defaultRarity = useMemo(() => {
    const list = getRaritiesForCharacter(defaultChar);
    return list.find((r) => r.label === 'LR3') || list.find((r) => r.label === 'LR5') || list[list.length - 1];
  }, [defaultChar]);

  const [selectedRarity, setSelectedRarity] = useState<RarityEntry>(defaultRarity);
  const [level, setLevel] = useState<number>(333);
  const [subLevel, setSubLevel] = useState<number>(0);
  const [mode, setMode] = useState<'pure_base' | 'account_mirror'>('account_mirror');
  const [playerRank, setPlayerRank] = useState<number>(434);
  const [roundingMethod, setRoundingMethod] = useState<RoundingMethod>('floor_grand');
  const [defRatioMode, setDefRatioMode] = useState<'exact_fraction' | 'screenshot_decimal'>('exact_fraction');

  // Search & Filter State for Character Selector
  const [selectedElement, setSelectedElement] = useState<ElementId | 'ALL'>('ALL');
  const [selectedJob, setSelectedJob] = useState<JobType | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 2. Arcana Selection State: Record<arcanaId, { active: boolean, tier: ArcanaTierKey }>
  // Default initial: Exactly the 5 verified account Arcana (Albireo SR, Taurus LR, Ursa LR, Monoceros LR, Sagittarius LR)
  const [arcanaSelections, setArcanaSelections] = useState<ArcanaSelectionMap>(() => {
    const initial: ArcanaSelectionMap = {};
    initial[1] = { active: true, tier: 'LR' };  // Taurus Protection (P/M DEF +3000)
    initial[4] = { active: true, tier: 'LR' };  // Ursa's Insight (Debuff RES 1500, ACC 1%)
    initial[5] = { active: true, tier: 'LR' };  // Monoceros's Roar (ATK 5000, CRIT DMG Boost 15%)
    initial[7] = { active: true, tier: 'SR' };  // Albireo's Gemstone (MAG +300 Group)
    initial[12] = { active: true, tier: 'LR' }; // Sagittarius's Glow (Counter 3%)
    return initial;
  });

  // Active Tab: 5 Clean Tabs
  // 1: 'calculator' (Kalkulator Utama)
  // 2: 'breakdown' (Rincian CP & Potensial)
  // 3: 'arcana' (Daftar 97 Arcana)
  // 4: 'reference' (Formula & Master Data)
  // 5: 'gear' (Lab Analisis Gear - Terisolasi)
  const [activeTab, setActiveTab] = useState<'calculator' | 'breakdown' | 'arcana' | 'reference' | 'gear'>('calculator');

  // 3. Integrated Gear State (6 Slots)
  const [enableGear, setEnableGear] = useState<boolean>(true);
  const [gearConfigs, setGearConfigs] = useState<Record<GearSlotType, GearPieceConfig>>({
    weapon: {
      seriesId: 'Normal',
      gearLevel: Math.min(level, 20),
      upgradeLevel: 0,
      isSignatureWeapon: false,
    },
    helmet: {
      seriesId: 'Normal',
      gearLevel: Math.min(level, 20),
      upgradeLevel: 0,
    },
    armor: {
      seriesId: 'Normal',
      gearLevel: Math.min(level, 20),
      upgradeLevel: 0,
    },
    necklace: {
      seriesId: 'Normal',
      gearLevel: Math.min(level, 20),
      upgradeLevel: 0,
    },
    gloves: {
      seriesId: 'Normal',
      gearLevel: Math.min(level, 20),
      upgradeLevel: 0,
    },
    boots: {
      seriesId: 'Normal',
      gearLevel: Math.min(level, 20),
      upgradeLevel: 0,
    },
  });

  const handleUpdateGearConfig = (slot: GearSlotType, updates: Partial<GearPieceConfig>) => {
    setGearConfigs((prev) => ({
      ...prev,
      [slot]: {
        ...prev[slot],
        ...updates,
      },
    }));
  };

  // Evaluate 6 gear pieces
  const evaluatedPieces = useMemo(() => {
    const map: Record<GearSlotType, ReturnType<typeof evaluateGearPiece>> = {} as any;
    GEAR_SLOTS.forEach((slot) => {
      map[slot.id] = evaluateGearPiece({
        slot: slot.id,
        config: gearConfigs[slot.id],
        charLevel: level,
        charRarityLabel: selectedRarity.label,
        charJob: selectedChar.job,
        charName: selectedChar.nameEn,
        charSpeed: selectedChar.baseSpeed,
      });
    });
    return map;
  }, [gearConfigs, level, selectedRarity, selectedChar]);

  // Total Character CP from all 6 gear pieces
  const totalGearCp = useMemo(() => {
    return Object.values(evaluatedPieces).reduce((sum, p) => sum + p.characterCpContribution, 0);
  }, [evaluatedPieces]);

  // Total Standalone Item Score from all 6 pieces
  const totalStandaloneScore = useMemo(() => {
    return Object.values(evaluatedPieces).reduce((sum, p) => sum + p.standaloneGearCardPower, 0);
  }, [evaluatedPieces]);

  // Handle individual Arcana update
  const handleUpdateArcanaSelection = (
    id: number,
    active: boolean,
    tier: ArcanaTierKey
  ) => {
    setArcanaSelections((prev) => ({
      ...prev,
      [id]: { active, tier },
    }));
  };

  // Batch set all Arcana to a specific tier
  const handleBatchSetTier = (tier: ArcanaTierKey) => {
    setArcanaSelections((prev) => {
      const next: ArcanaSelectionMap = { ...prev };
      for (const item of ARCANA_CATALOG) {
        if (item.tiers[tier]) {
          next[item.id] = { active: true, tier };
        }
      }
      return next;
    });
  };

  // Reset all Arcana checkboxes
  const handleResetAllArcana = () => {
    setArcanaSelections({});
  };

  // When selected character changes, ensure the rarity belongs to its correct base table (N, R, or SR)
  const handleSelectChar = (char: CharacterEntry) => {
    setSelectedChar(char);
    const validRarities = getRaritiesForCharacter(char);
    const sameLabel = validRarities.find((r) => r.label === selectedRarity.label);
    if (sameLabel) {
      setSelectedRarity(sameLabel);
    } else {
      setSelectedRarity(validRarities.find((r) => r.label === 'LR5') || validRarities[0]);
    }
  };

  // 3. Evaluate Aggregated Arcana Modifiers for Selected Character
  const {
    modifiers: arcanaModifiers,
    activeCount,
    applicableCount,
  } = useMemo(() => {
    return calculateArcanaModifiersForCharacter(
      selectedChar,
      arcanaSelections,
      level
    );
  }, [selectedChar, arcanaSelections, level]);

  // 4. Combat Power and Stats Evaluation
  const result = useMemo(() => {
    return calculateCharacterStats({
      character: selectedChar,
      rarity: selectedRarity,
      level,
      subLevel,
      mode,
      playerRank,
      modifiers: arcanaModifiers,
      roundingMethod,
      defRatioMode,
    });
  }, [
    selectedChar,
    selectedRarity,
    level,
    subLevel,
    mode,
    playerRank,
    arcanaModifiers,
    roundingMethod,
    defRatioMode,
  ]);

  // Quick Preset Handlers
  const applyPresetUserCordie = () => {
    const cordie = CHARACTERS.find((c) => c.nameEn === 'Cordie' || c.nameJp === 'コルディ');
    if (cordie) {
      setSelectedChar(cordie);
      const list = getRaritiesForCharacter(cordie);
      const lr5 = list.find((r) => r.label === 'LR5') || list[0];
      setSelectedRarity(lr5);
    }
    setLevel(333);
    setSubLevel(0);
    setPlayerRank(433);
    setMode('account_mirror');
    // Set typical account Arcana: Taurus, Lynx, Ursa, Monoceros, Andromeda, Albireo, Artemis
    setArcanaSelections({
      1: { active: true, tier: 'LR' }, // Taurus (P/M DEF +3000)
      2: { active: true, tier: 'LR' }, // Lynx (P.CRIT Cut 15%, C.RES 1500)
      4: { active: true, tier: 'LR' }, // Ursa (Debuff RES 1500, ACC 1%)
      5: { active: true, tier: 'LR' }, // Monoceros (ATK 5000, CRIT DMG Boost 15%)
      8: { active: true, tier: 'LR' }, // Artemis (HP 5%, ACC Lv*70)
      12: { active: true, tier: 'LR' }, // Sagittarius (Counter 3%)
    });
  };

  const applyPresetUserFlorence = () => {
    const flo = CHARACTERS.find((c) => c.nameEn === 'Florence' || c.nameJp === 'フローレンス');
    if (flo) {
      setSelectedChar(flo);
      const list = getRaritiesForCharacter(flo);
      const lr3 = list.find((r) => r.label === 'LR3') || list[0];
      setSelectedRarity(lr3);
    }
    setLevel(333);
    setSubLevel(0);
    setPlayerRank(434);
    setMode('account_mirror');
    // Set precisely the 5 verified account Arcana
    setArcanaSelections({
      1: { active: true, tier: 'LR' },  // Taurus Protection (P/M DEF +3000)
      4: { active: true, tier: 'LR' },  // Ursa's Insight (Debuff RES 1500, ACC 1%)
      5: { active: true, tier: 'LR' },  // Monoceros's Roar (ATK 5000, CRIT DMG Boost 15%)
      7: { active: true, tier: 'SR' },  // Albireo's Gemstone (MAG +300 Group)
      12: { active: true, tier: 'LR' }, // Sagittarius's Glow (Counter 3%)
    });
  };

  // Preset Sampel Mertillier (Lv.21 SR Rank 34) + 6 Quest Gear Lv 20 (+20 tempa)
  const applyPresetUserMertillier = () => {
    const mert = CHARACTERS.find((c) => c.nameEn === 'Mertillier' || c.nameJp === 'メルティーユ');
    if (mert) {
      setSelectedChar(mert);
      const list = getRaritiesForCharacter(mert);
      const sr = list.find((r) => r.label === 'SR') || list[0];
      setSelectedRarity(sr);
    }
    setLevel(21);
    setSubLevel(0);
    setPlayerRank(34);
    setMode('account_mirror');
    setArcanaSelections({}); // No Arcana on early rank 34
    setEnableGear(true);
    setGearConfigs({
      weapon: {
        seriesId: 'Normal',
        questGrade: 'A',
        gearLevel: 20,
        upgradeLevel: 20,
        isSignatureWeapon: false,
        customSubStats: [
          { statName: 'MAG', value: 47 },
          { statName: 'DEX', value: 43 },
          { statName: 'STA', value: 47 },
        ],
      },
      necklace: {
        seriesId: 'Normal',
        questGrade: 'S',
        gearLevel: 20,
        upgradeLevel: 20,
        customSubStats: [
          { statName: 'STR', value: 50 },
          { statName: 'MAG', value: 47 },
          { statName: 'DEX', value: 43 },
          { statName: 'STA', value: 43 },
        ],
      },
      gloves: {
        seriesId: 'Normal',
        questGrade: 'A',
        gearLevel: 20,
        upgradeLevel: 20,
        customSubStats: [
          { statName: 'STR', value: 45 },
          { statName: 'MAG', value: 47 },
          { statName: 'STA', value: 45 },
        ],
      },
      helmet: {
        seriesId: 'Normal',
        questGrade: 'S',
        gearLevel: 20,
        upgradeLevel: 20,
        customSubStats: [
          { statName: 'STR', value: 48 },
          { statName: 'MAG', value: 46 },
          { statName: 'DEX', value: 43 },
          { statName: 'STA', value: 46 },
        ],
      },
      armor: {
        seriesId: 'Normal',
        questGrade: 'C',
        gearLevel: 20,
        upgradeLevel: 20,
        customSubStats: [{ statName: 'MAG', value: 45 }],
      },
      boots: {
        seriesId: 'Normal',
        questGrade: 'A',
        gearLevel: 20,
        upgradeLevel: 20,
        customSubStats: [
          { statName: 'STR', value: 47 },
          { statName: 'DEX', value: 45 },
          { statName: 'STA', value: 45 },
        ],
      },
    });
  };

  // Preset High-End Metatron LR & Satan SSR Gear (With Augment & Reforge)
  const applyHighEndGearPreset = () => {
    setEnableGear(true);
    setGearConfigs({
      weapon: {
        seriesId: 'Metatron',
        gearLevel: Math.min(level, 330),
        upgradeLevel: Math.min(level, 330),
        isSignatureWeapon: true,
        augment: {
          magicAugmentLevel: 30, // +5,400 DEF Break (+37,800 CP)
          holyAugmentLevel: 25,  // +80,000 ATK (+160,000 CP)
        },
        reforge: {
          str: 650,
          dex: 450,
          mag: 300,
          sta: 550,
          lockedStats: ['STR'],
        },
      },
      necklace: {
        seriesId: 'Metatron',
        gearLevel: Math.min(level, 330),
        upgradeLevel: Math.min(level, 240),
        augment: {
          magicAugmentLevel: 20, // +4,400 Critical
          holyAugmentLevel: 15,
        },
        reforge: {
          str: 400,
          dex: 550,
          mag: 420,
          sta: 400,
        },
      },
      gloves: {
        seriesId: 'Metatron',
        gearLevel: Math.min(level, 330),
        upgradeLevel: Math.min(level, 240),
        augment: {
          magicAugmentLevel: 20, // Accuracy
          holyAugmentLevel: 15,
        },
        reforge: {
          str: 520,
          dex: 480,
          mag: 380,
          sta: 420,
        },
      },
      helmet: {
        seriesId: 'Metatron',
        gearLevel: Math.min(level, 330),
        upgradeLevel: Math.min(level, 240),
        augment: {
          magicAugmentLevel: 20, // Debuff RES
          holyAugmentLevel: 15,
        },
        reforge: {
          str: 500,
          dex: 400,
          mag: 380,
          sta: 500,
        },
      },
      armor: {
        seriesId: 'Satan',
        gearLevel: Math.min(level, 270),
        upgradeLevel: Math.min(level, 180),
        augment: {
          magicAugmentLevel: 15, // Crit Cut
          holyAugmentLevel: 10,
        },
        reforge: {
          str: 350,
          dex: 350,
          mag: 350,
          sta: 450,
        },
      },
      boots: {
        seriesId: 'Satan',
        gearLevel: Math.min(level, 270),
        upgradeLevel: Math.min(level, 180),
        augment: {
          magicAugmentLevel: 15, // Evasion
          holyAugmentLevel: 10,
        },
        reforge: {
          str: 400,
          dex: 420,
          mag: 320,
          sta: 400,
        },
      },
    });
  };

  const loadFlorencePure = () => {
    const flo = CHARACTERS.find((c) => c.nameEn === 'Florence' || c.nameJp === 'フローレンス');
    if (flo) {
      setSelectedChar(flo);
      const list = getRaritiesForCharacter(flo);
      const sr = list.find((r) => r.label === 'SR') || list[0];
      setSelectedRarity(sr);
    }
    setLevel(1);
    setSubLevel(0);
    setMode('pure_base');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Bar (3 Zones) */}
      <header className="border-b border-slate-800 bg-[#0E1526]/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex items-center justify-between">
        {/* Zone 1: Brand title */}
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
            <span className="text-amber-400 font-serif text-xl">†</span>
            Memento Mori Stat & CP Engine
          </span>
          <span className="hidden sm:inline-block text-xs font-mono text-slate-400 border-l border-slate-800 pl-3">
            97 Arcana Checklist & Master ScobraCK
          </span>
        </div>

        {/* Zone 2: Navigation tabs (4 Halaman Bersih) */}
        <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-900/90 p-1 border border-slate-800 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'calculator'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>⚔️</span>
            <span>1. Kalkulator</span>
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'breakdown'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📊</span>
            <span>2. Rincian CP & Potensi</span>
          </button>
          <button
            onClick={() => setActiveTab('arcana')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'arcana'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>✦</span>
            <span>3. Koleksi 97 Arcana</span>
            {activeCount > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-[10px] font-mono">
                {activeCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('reference')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'reference'
                ? 'bg-slate-800 text-amber-300 font-semibold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>📜</span>
            <span>4. Formula & Master</span>
          </button>
          <button
            onClick={() => setActiveTab('gear')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'gear'
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/50 font-semibold shadow-sm'
                : 'text-amber-400/80 hover:text-amber-200 hover:bg-slate-800/60'
            }`}
          >
            <span>⚙️</span>
            <span>5. Lab Gear (Beta)</span>
          </button>
        </nav>

        {/* Zone 3: Quick Action Presets */}
        <div className="flex items-center gap-2">
          <button
            onClick={applyPresetUserFlorence}
            title="Muat Akun Anda: Florence LR3 Rank 434 Level 333 + 5 Arcana Akun (CP: 22,954,095)"
            className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 rounded shadow-md transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <span>🎯</span>
            <span className="font-bold">Florence Akun</span>
            <span className="hidden sm:inline">(R434 · Lv333)</span>
          </button>
          <button
            onClick={applyPresetUserMertillier}
            title="Muat Sampel Akun Mertillier: SR Lv 21 Rank 34 + 6 Quest Gear Lv 20 (+20 tempa) -> CP 8,421"
            className="px-3 py-1.5 text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded shadow-md transition-all whitespace-nowrap flex items-center gap-1.5"
          >
            <span>🛡️</span>
            <span className="font-bold">Mertillier Gear (8,421 CP)</span>
          </button>
          <button
            onClick={applyPresetUserCordie}
            title="Muat Sampel Akun Anda (Cordie LR+5 Rank 433 Level 333)"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded shadow-md transition-all whitespace-nowrap"
          >
            <span>★</span>
            <span>Cordie LR+5</span>
          </button>
          <button
            onClick={loadFlorencePure}
            title="Florence Lv.1 Pure Base"
            className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded bg-sky-950/60 border border-sky-800/60 text-sky-300 hover:bg-sky-900/60 transition-colors"
          >
            <span>💧</span>
            <span>Florence Lv.1</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6">
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Controls Column (4 cols) */}
            <div className="lg:col-span-4 bg-[#0F172A]/80 border border-slate-800 rounded-xl p-4 sm:p-5 shadow-lg space-y-5 lg:sticky lg:top-20">
              <CharacterSelector
                characters={CHARACTERS}
                selectedChar={selectedChar}
                onSelectChar={handleSelectChar}
                selectedElement={selectedElement}
                onSelectElement={setSelectedElement}
                selectedJob={selectedJob}
                onSelectJob={setSelectedJob}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />

              <ConfigurationPanel
                character={selectedChar}
                rarity={selectedRarity}
                onRarityChange={setSelectedRarity}
                level={level}
                onLevelChange={setLevel}
                subLevel={subLevel}
                onSubLevelChange={setSubLevel}
                mode={mode}
                onModeChange={setMode}
                playerRank={playerRank}
                onPlayerRankChange={setPlayerRank}
                roundingMethod={roundingMethod}
                onRoundingChange={setRoundingMethod}
                defRatioMode={defRatioMode}
                onDefRatioChange={setDefRatioMode}
              />
            </div>

            {/* Right Display Column (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Hero CP & Primary Stats */}
              <StatOverviewHero
                result={result}
                character={selectedChar}
                mode={mode}
                gearCp={totalGearCp}
                enableGear={enableGear}
              />

              {/* Integrated 6-Slot Gear Module with ON/OFF Toggle Switch */}
              <GearSummaryDrawer
                enableGear={enableGear}
                onToggleEnableGear={setEnableGear}
                gearConfigs={gearConfigs}
                evaluatedPieces={evaluatedPieces}
                totalGearCp={totalGearCp}
                totalStandaloneScore={totalStandaloneScore}
                characterSpeed={selectedChar.baseSpeed}
                onUpdateGearLevel={(slot, lvl) => handleUpdateGearConfig(slot, { gearLevel: lvl })}
                onUpdateUpgradeLevel={(slot, upg) => handleUpdateGearConfig(slot, { upgradeLevel: upg })}
                onUpdateGrade={(slot, gr) => handleUpdateGearConfig(slot, { questGrade: gr })}
                onOpenGearLab={() => setActiveTab('gear')}
                onApplyMertillierGearPreset={applyPresetUserMertillier}
                onApplyHighEndGearPreset={applyHighEndGearPreset}
              />

              {/* Arcana Checklist Drawer in Account Mirror Mode */}
              {mode === 'account_mirror' && (
                <ArcanaChecklistDrawer
                  arcanaSelections={arcanaSelections}
                  onUpdateSelection={handleUpdateArcanaSelection}
                  onBatchSetTier={handleBatchSetTier}
                  onResetAll={handleResetAllArcana}
                  onApplyFlorenceAccountPreset={applyPresetUserFlorence}
                  currentCharacter={selectedChar}
                  onOpenFullCatalog={() => setActiveTab('arcana')}
                  activeCount={activeCount}
                  applicableCount={applicableCount}
                />
              )}

              {/* Quick Jump Banner to Page 2 */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <div className="text-slate-400">
                  Ingin melihat rincian konversi matematis setiap stat & 4 potensial dasar?
                </div>
                <button
                  onClick={() => setActiveTab('breakdown')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold rounded-lg border border-slate-700 transition-colors shrink-0"
                >
                  Buka Rincian CP & Potensial (Hal 2) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Halaman 2: Rincian Combat Power & 4 Potensial Dasar */}
        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            <CpBreakdownPage
              result={result}
              character={selectedChar}
              mode={mode}
            />
          </div>
        )}

        {/* Halaman 3: Katalog Lengkap 97 Arcana (Aktif & Non-Aktif) */}
        {activeTab === 'arcana' && (
          <ArcanaCatalogTab
            arcanaSelections={arcanaSelections}
            onUpdateSelection={handleUpdateArcanaSelection}
            onBatchSetTier={handleBatchSetTier}
            onResetAll={handleResetAllArcana}
            onApplyFlorenceAccountPreset={applyPresetUserFlorence}
            currentCharacter={selectedChar}
          />
        )}

        {/* Halaman 4: Formula & Master Data & Download Source Code */}
        {activeTab === 'reference' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <MasterVerificationReference />
          </div>
        )}

        {/* Halaman 5: Lab Analisis Gear (Terhubung ke Kalkulator Utama) */}
        {activeTab === 'gear' && (
          <GearLabTab
            currentCharacter={selectedChar}
            currentRarity={selectedRarity}
            characterLevel={level}
            gearConfigs={gearConfigs}
            onUpdateConfig={handleUpdateGearConfig}
            onSetAllConfigs={setGearConfigs}
          />
        )}
      </main>
    </div>
  );
}
