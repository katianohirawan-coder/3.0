import React from 'react';
import { EngineResult } from '../types/statEngine';
import { CharacterEntry, ELEMENT_DEFINITIONS } from '../types/memento';

interface StatOverviewHeroProps {
  result: EngineResult;
  character: CharacterEntry;
  mode: 'pure_base' | 'account_mirror';
  gearCp?: number;
  enableGear?: boolean;
}

export const StatOverviewHero: React.FC<StatOverviewHeroProps> = ({
  result,
  character,
  mode,
  gearCp = 0,
  enableGear = false,
}) => {
  const elem = ELEMENT_DEFINITIONS[character.elementType];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      {/* Background ambient glow matching element */}
      <div
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
        style={{ backgroundColor: elem.color }}
      />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl" title={elem.name}>
              {elem.icon}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded border font-medium ${elem.badgeBg}`}
            >
              {elem.name} ({elem.jpName})
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
              {character.job}
            </span>
            <span className="text-xs text-slate-500 font-mono">
              ID #{character.id}
            </span>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>{character.nameEn}</span>
            <span className="text-sm font-normal text-slate-400">
              ({character.nameJp})
            </span>
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>Base SPD: <strong className="text-slate-200 font-mono">{character.baseSpeed}</strong></span>
            <span>·</span>
            <span>Gross Coeff: <strong className="text-slate-200 font-mono">{character.gross}</strong></span>
            <span>·</span>
            <span>Rarity: <strong className="text-amber-300 font-mono">{result.roundingMethod}</strong></span>
          </div>
        </div>

        {/* Combat Power Giant Metric */}
        {(() => {
          const grandTotalCp = result.activeCp + (enableGear ? gearCp : 0);
          return (
            <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl px-5 py-3 text-right">
              <div className="text-[11px] font-semibold tracking-wider uppercase text-amber-400/90 mb-0.5 flex items-center justify-end gap-1.5">
                <span>Total Combat Power (CP / 戦闘力)</span>
                {enableGear && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.2 rounded font-mono">
                    +Gear Aktif
                  </span>
                )}
              </div>
              <div className="text-3xl md:text-4xl font-extrabold font-mono tracking-tight text-amber-300 tabular-nums">
                {grandTotalCp.toLocaleString()}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-end gap-2 flex-wrap">
                {enableGear && (
                  <span className="text-amber-400 font-semibold font-mono">
                    Gear: +{gearCp.toLocaleString()} CP
                  </span>
                )}
                {mode === 'account_mirror' ? (
                  <>
                    <span className="text-slate-500">Murni: {result.pureBaseCp.toLocaleString()}</span>
                    <span className="text-emerald-400 font-semibold font-mono">
                      Arcana: +{result.accountBonusCp.toLocaleString()} CP
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 font-mono">
                    Speed Coupling: +{Math.floor(result.speedCp).toLocaleString()} CP
                  </span>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Final ATK and Final HP Direct In-Game Stat Cards */}
      <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-gradient-to-r from-amber-950/40 to-slate-950/80 border border-amber-500/40 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>⚔️ Final ATK (攻撃力)</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-200 px-1.5 py-0.2 rounded border border-amber-500/30">
                In-Game
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-amber-200 tabular-nums mt-0.5">
              {result.finalAtk.toLocaleString()}
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400">
            <div>Potensi: {(result.str * 2).toLocaleString()}</div>
            <div className="text-amber-400/90 font-semibold">CP: {(result.finalAtk * 2).toLocaleString()}</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-950/40 to-slate-950/80 border border-emerald-500/40 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
              <span>❤️ Final HP (耐久/体力)</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-200 px-1.5 py-0.2 rounded border border-emerald-500/30">
                In-Game
              </span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-200 tabular-nums mt-0.5">
              {result.finalHp.toLocaleString()}
            </div>
          </div>
          <div className="text-right text-[11px] font-mono text-slate-400">
            <div>Potensi: {(result.sta * 10).toLocaleString()}</div>
            <div className="text-emerald-400/90 font-semibold">CP: {Math.floor(result.finalHp * 0.05).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* 4 Primary Potentials Strip */}
      <div className="pt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-rose-300">Muscle (STR / 腕力)</span>
            {character.job === 'Warrior' && (
              <span className="text-[9px] bg-rose-950/80 text-rose-300 border border-rose-800/50 px-1 rounded">
                JOB ATK
              </span>
            )}
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {result.str.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            P.DEF +{result.str.toLocaleString()} · Hit +{Math.floor(result.str * 0.5).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-emerald-300">Energy (DEX / 技力)</span>
            {character.job === 'Sniper' && (
              <span className="text-[9px] bg-emerald-950/80 text-emerald-300 border border-emerald-800/50 px-1 rounded">
                JOB ATK
              </span>
            )}
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {result.dex.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            EVA +{Math.floor(result.dex * 0.5).toLocaleString()} · Crit +{Math.floor(result.dex * 0.5).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-sky-300">Intelligence (MAG / 魔力)</span>
            {character.job === 'Sorcerer' && (
              <span className="text-[9px] bg-sky-950/80 text-sky-300 border border-sky-800/50 px-1 rounded">
                JOB ATK
              </span>
            )}
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {result.mag.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            M.DEF +{result.mag.toLocaleString()} · Debuff ACC +{Math.floor(result.mag * 0.5).toLocaleString()}
          </div>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold text-amber-300">Health (STA / 耐久力)</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
            {result.sta.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            HP +{(result.sta * 10).toLocaleString()} · Crit RES +{Math.floor(result.sta * 0.5).toLocaleString()}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 rounded-lg px-3 py-1.5 border border-slate-800/50">
        <span>
          Total Potentials: <strong className="text-slate-200 font-mono">{result.sumPotential.toLocaleString()}</strong>
        </span>
        <span>
          Base Potential (Lv): <strong className="text-slate-300 font-mono">{result.rawLevelBase.toLocaleString()}</strong>
        </span>
        <span>
          Scaled Potential: <strong className="text-amber-300 font-mono">{result.scaledTotal.toLocaleString()}</strong>
        </span>
      </div>
    </div>
  );
};
