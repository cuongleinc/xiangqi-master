import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/game.store';
import { useUiStore } from '../../stores/ui.store';
import { useSettingsStore } from '../../stores/settings.store';
import type { MatchType } from '@repo/shared';

interface NewGameDialogProps {
  isInitial?: boolean;
}

const matchTypes: Array<{ value: MatchType; en: string; zh: string; icon: string; desc: string }> = [
  { value: 'pvc', en: 'vs Computer', zh: '人機對戰', icon: '⚔️', desc: 'Play against the AI engine' },
  { value: 'pvp', en: 'vs Player', zh: '雙人對弈', icon: '👥', desc: 'Two players, one board' },
  { value: 'cvc', en: 'AI vs AI', zh: '電腦對戰', icon: '🤖', desc: 'Watch two AIs battle' },
  { value: 'analysis', en: 'Analysis', zh: '分析模式', icon: '🔍', desc: 'Free board, explore positions' },
];

const difficulties = [
  { value: 'easy', en: 'Easy', zh: '初學', time: '0.1s', timeLabel: '100ms' },
  { value: 'medium', en: 'Medium', zh: '中級', time: '0.5s', timeLabel: '500ms' },
  { value: 'hard', en: 'Hard', zh: '高級', time: '1.5s', timeLabel: '1.5s' },
  { value: 'expert', en: 'Expert', zh: '專家', time: '5s', timeLabel: '5.0s' },
];

const PIECE_CHARS_LIST = ['將', '帥', '車', '馬', '炮', '象', '士', '兵'];

// ─── Fog particle presets ───
const fogPresets = [
  { left: '5%', top: '20%', w: 300, h: 300, color: 'rgba(139,26,26,0.06)', dur: 16, delay: '0s', blur: 60 },
  { left: '15%', top: '60%', w: 220, h: 220, color: 'rgba(80,10,10,0.04)', dur: 14, delay: '-3s', blur: 50 },
  { left: '30%', top: '40%', w: 350, h: 350, color: 'rgba(100,20,20,0.05)', dur: 18, delay: '-7s', blur: 70 },
  { left: '8%', top: '80%', w: 250, h: 250, color: 'rgba(90,10,10,0.04)', dur: 12, delay: '-10s', blur: 55 },
  { right: '5%', top: '15%', w: 280, h: 280, color: 'rgba(26,50,139,0.05)', dur: 15, delay: '-2s', blur: 60 },
  { right: '20%', top: '55%', w: 320, h: 320, color: 'rgba(10,20,80,0.04)', dur: 17, delay: '-8s', blur: 65 },
  { right: '10%', top: '75%', w: 200, h: 200, color: 'rgba(20,40,100,0.05)', dur: 13, delay: '-5s', blur: 50 },
  { right: '25%', top: '35%', w: 380, h: 380, color: 'rgba(15,30,90,0.03)', dur: 19, delay: '-12s', blur: 75 },
  { left: '48%', top: '50%', w: 150, h: 150, color: 'rgba(212,168,67,0.03)', dur: 20, delay: '-4s', blur: 45 },
  { left: '52%', top: '20%', w: 120, h: 120, color: 'rgba(212,168,67,0.03)', dur: 14, delay: '-9s', blur: 40 },
  { left: '49%', top: '70%', w: 180, h: 180, color: 'rgba(212,168,67,0.03)', dur: 16, delay: '-6s', blur: 50 },
  { left: '51%', top: '40%', w: 100, h: 100, color: 'rgba(212,168,67,0.04)', dur: 12, delay: '-11s', blur: 35 },
];

// ─── Floating background pieces ───
const floatingPieces = [
  { char: '將', left: '4%', top: '15%', delay: '0s', dur: 24, color: '#3a5fa0' },
  { char: '帥', right: '4%', top: '20%', delay: '-3s', dur: 28, color: '#c0392b' },
  { char: '車', left: '12%', top: '70%', delay: '-7s', dur: 32, color: '#3a5fa0' },
  { char: '馬', right: '12%', top: '65%', delay: '-12s', dur: 22, color: '#c0392b' },
  { char: '炮', left: '22%', top: '35%', delay: '-5s', dur: 26, color: '#3a5fa0' },
  { char: '象', right: '20%', top: '40%', delay: '-9s', dur: 30, color: '#c0392b' },
  { char: '士', left: '35%', top: '85%', delay: '-15s', dur: 20, color: '#3a5fa0' },
  { char: '兵', right: '30%', top: '80%', delay: '-18s', dur: 35, color: '#c0392b' },
];

export const NewGameDialog: React.FC<NewGameDialogProps> = ({ isInitial }) => {
  const createNewGame = useGameStore((s) => s.createNewGame);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const setDifficulty = useSettingsStore((s) => s.setDifficulty);
  const matchType = useSettingsStore((s) => s.matchType);
  const setMatchType = useSettingsStore((s) => s.setMatchType);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const showDifficulty = matchType === 'pvc' || matchType === 'cvc';

  const handleStart = async () => {
    await createNewGame(difficulty, matchType);
    closeDialog();
  };

  // ─── In-game compact dialog ───
  if (!isInitial) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-lacquer border border-gold/40 rounded-xl p-6 max-w-sm mx-auto">
          <h2 className="text-xl font-bold text-gold-light font-serif mb-2 text-center">New Game</h2>
          {/* Match type */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {matchTypes.map((m) => (
              <button key={m.value} onClick={() => setMatchType(m.value)} className={`p-2 rounded-md text-left transition-all border text-xs ${matchType === m.value ? 'bg-gold/20 border-gold text-gold-light' : 'bg-lacquer/50 text-cream-dim border-gold/20 hover:border-gold/50'}`}>
                <div className="font-medium">{m.icon} {m.en}</div>
              </button>
            ))}
          </div>
          {/* Difficulty (only for PvC and CvC) */}
          {showDifficulty && (
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {difficulties.map((d) => (
                <button key={d.value} onClick={() => setDifficulty(d.value)} className={`p-2.5 rounded-lg text-left transition-all border ${difficulty === d.value ? 'bg-gold text-ebony border-gold' : 'bg-lacquer/50 text-cream-dim border-gold/20 hover:border-gold/50'}`}>
                  <div className="font-medium text-xs">{d.en}</div><div className="text-[9px] opacity-70">{d.zh}</div>
                </button>
              ))}
            </div>
          )}
          <button onClick={handleStart} className="w-full bg-gold hover:bg-gold-light text-ebony font-bold py-2.5 rounded-lg font-serif tracking-wide text-sm">Play</button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // WELCOME SCREEN — Chu-Han Contention
  // ═══════════════════════════════════════════════
  return (
    <div className="welcome-screen" style={{ position: 'fixed', inset: 0, overflow: 'hidden', zIndex: 100 }}>
      {/* ─── LAYER 0: Battle background image ─── */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(/battle_bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center top', backgroundRepeat: 'no-repeat',
        zIndex: -1,
      }} />
      {/* Overlays on top of image for text readability */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,2,0,0.55)', zIndex: -1 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #050100 0%, transparent 40%)', zIndex: -1 }} />
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #050100 0%, transparent 25%)', zIndex: -1 }} />

      {/* ─── LAYER 1: Base atmosphere ─── */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 120% 80% at 50% 110%, #3d1a00 0%, #1a0800 40%, #0a0400 70%, #050200 100%)', opacity: 0.5 }} />

      {/* ─── LAYER 2: Chu crimson (left) ─── */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: '45%', height: '100%', background: 'radial-gradient(ellipse at 20% 60%, rgba(139,26,26,0.25) 0%, transparent 65%)', pointerEvents: 'none' }} />

      {/* ─── LAYER 3: Han blue (right) ─── */}
      <div style={{ position: 'absolute', right: 0, top: 0, width: '45%', height: '100%', background: 'radial-gradient(ellipse at 80% 60%, rgba(26,50,120,0.2) 0%, transparent 65%)', pointerEvents: 'none' }} />


      {/* ─── LAYER 5: Fog particles ─── */}
      {fogPresets.map((f, i) => (
        <div
          key={`fog-${i}`}
          className="fog-particle"
          style={{
            position: 'absolute',
            width: f.w, height: f.h, borderRadius: '50%',
            background: f.color,
            filter: `blur(${f.blur}px)`,
            left: f.left, right: f.right, top: f.top,
            animation: `fogFloat ${f.dur}s ease-in-out infinite alternate`,
            animationDelay: f.delay,
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      ))}

      {/* ─── LAYER 6: Ghost warriors ─── */}
      <svg
        style={{ position: 'absolute', bottom: '-5%', left: '5%', height: '85vh', opacity: 0.06, filter: 'blur(2px)', pointerEvents: 'none', zIndex: 1 }}
        viewBox="0 0 200 600" width="200" height="600"
      >
        <animateTransform attributeName="transform" type="scale" values="1;1.03;1" dur="4s" repeatCount="indefinite" />
        <polygon points="100,30 85,50 88,80 70,100 75,130 60,160 65,190 55,220 60,250 50,280 55,310 48,350 55,400 45,450 55,500 65,520 75,510 85,530 95,520 105,540 115,520 125,530 135,510 145,520 155,500 145,450 155,400 148,350 155,310 148,280 155,250 145,220 155,190 140,160 145,130 130,100 135,80 115,50" fill="#c0392b" />
        <rect x="60" y="60" width="80" height="14" rx="4" fill="#c0392b" opacity="0.5" />
        <rect x="55" y="78" width="90" height="10" rx="3" fill="#c0392b" opacity="0.4" />
      </svg>

      <svg
        style={{ position: 'absolute', bottom: '-5%', right: '5%', height: '75vh', opacity: 0.05, filter: 'blur(2px)', pointerEvents: 'none', zIndex: 1 }}
        viewBox="0 0 200 600" width="200" height="600"
      >
        <animateTransform attributeName="transform" type="scale" values="1;1.03;1" dur="4s" repeatCount="indefinite" begin="-2s" />
        <polygon points="100,40 92,60 95,90 85,110 90,140 78,170 82,200 75,230 80,260 70,290 75,320 68,360 75,400 65,450 75,500 85,520 95,510 105,530 115,510 125,530 135,510 145,520 155,500 145,450 155,400 148,360 155,320 148,290 155,260 145,230 155,200 140,170 145,140 130,110 135,90 120,60" fill="#3a5fa0" />
        <rect x="75" y="50" width="50" height="12" rx="3" fill="#3a5fa0" opacity="0.4" />
      </svg>

      {/* ─── LAYER 7: Floating background pieces ─── */}
      {floatingPieces.map((p, i) => (
        <div key={`fp-${i}`} className="floating-bg-piece" style={{
          position: 'absolute', left: p.left, right: p.right, top: p.top,
          width: 48, height: 48, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, rgba(200,180,140,0.1), transparent 70%)`,
          border: `1px solid ${p.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, fontFamily: 'Ma Shan Zheng, serif', color: p.color + '10',
          animation: `pieceFloat ${p.dur}s linear infinite`, animationDelay: p.delay,
          pointerEvents: 'none', zIndex: 0,
        }}>{p.char}</div>
      ))}

      {/* ─── LAYER 8: Vignettes ─── */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, background: 'linear-gradient(to bottom, #050200 0%, transparent 30%)' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 3, background: 'linear-gradient(to top, #050200 0%, transparent 30%)' }} />

      {/* ═══════════════════════════════════════
           MAIN CONTENT
           ═══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10, padding: '2rem',
      }}>
        <div style={{
          width: 'min(680px, 90vw)', textAlign: 'center' as const,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          {/* ─── TITLE ─── */}
          <div className="title-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-30px)', transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s' }}>

            {/* ─── SUBTITLE ─── */}
            <div className="subtitle-section" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.4s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 14 }}>
              <div style={{ flex: 1, maxWidth: 80, height: 1, background: '#3d2010' }} />
              <span style={{ fontSize: '2.4rem', letterSpacing: '0.35em', color: '#d4b870', fontFamily: 'Noto Serif SC, serif', whiteSpace: 'nowrap', fontWeight: 600 }}>XIANGQI MASTER</span>
              <div style={{ flex: 1, maxWidth: 80, height: 1, background: '#3d2010' }} />
            </div>

            {/* ─── LORE TAGLINE ─── */}
            <div className="lore-section" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.6s', marginBottom: 10 }}>
              <p style={{ fontFamily: 'Noto Serif SC, serif', fontSize: '1.1rem', color: '#b89560', fontStyle: 'italic', lineHeight: 2, margin: 0 }}>The legendary Chu-Han Contention</p>
              <p style={{ fontFamily: 'Noto Serif SC, serif', fontSize: '1.1rem', color: '#b89560', fontStyle: 'italic', lineHeight: 2, margin: 0 }}>One game decides the fate of an empire</p>
            </div>
          </div>

          {/* ─── MATCH TYPE ─── */}
          <div className="matchtype-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease 0.7s, transform 0.5s ease 0.7s' }}>
            <p style={{ fontSize: '1rem', letterSpacing: '0.2em', color: '#c4a060', fontFamily: 'Noto Serif SC, serif', marginBottom: 12, fontWeight: 600 }}>MATCH TYPE</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
              {matchTypes.map((m) => {
                const active = matchType === m.value;
                return (
                  <button key={m.value} onClick={() => setMatchType(m.value)} className="match-card" style={{
                    background: active ? 'rgba(60,25,5,0.9)' : 'rgba(20,10,2,0.7)',
                    border: active ? '1.5px solid #d4a843' : '1px solid #2d1505',
                    borderRadius: 8, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' as const,
                    transition: 'all 0.25s ease',
                    backdropFilter: 'blur(8px)',
                    boxShadow: active ? '0 0 0 1px rgba(212,168,67,0.2), inset 0 0 20px rgba(212,168,67,0.05), 0 8px 30px rgba(0,0,0,0.5)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: active ? '#f0d080' : '#d4c5a0', fontFamily: 'Noto Serif SC, serif' }}>{m.en}</div>
                      <div style={{ fontSize: '0.65rem', color: '#8a7550', letterSpacing: '0.05em' }}>{m.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── DIFFICULTY (only PvC and CvC) ─── */}
          {showDifficulty && (
            <div className="difficulty-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease 0.85s, transform 0.5s ease 0.85s' }}>
              <p style={{ fontSize: '0.9rem', letterSpacing: '0.18em', color: '#b89560', fontFamily: 'Noto Serif SC, serif', marginBottom: 10, fontWeight: 600 }}>DIFFICULTY</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                {difficulties.map((d) => {
                  const active = difficulty === d.value;
                  return (
                    <button key={d.value} onClick={() => setDifficulty(d.value)} className="diff-card" style={{
                      background: active ? 'rgba(60,25,5,0.9)' : 'rgba(20,10,2,0.7)',
                      border: active ? '1.5px solid #d4a843' : '1px solid #2d1505',
                      borderRadius: 8, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' as const,
                      transition: 'all 0.25s ease',
                      backdropFilter: 'blur(8px)',
                      boxShadow: active ? '0 0 0 1px rgba(212,168,67,0.2), inset 0 0 20px rgba(212,168,67,0.05), 0 8px 30px rgba(0,0,0,0.5)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: active ? '#f0d080' : '#d4c5a0', fontFamily: 'Noto Serif SC, serif' }}>{d.en}</div>
                        <div style={{ fontSize: '0.65rem', color: '#b89560', letterSpacing: '0.1em' }}>{d.zh}</div>
                      </div>
                      <span style={{ fontSize: '0.6rem', color: '#6b4c1a', background: '#1a0f00', padding: '2px 8px', borderRadius: 20, border: '1px solid #3d2010', fontFamily: 'monospace' }}>{d.timeLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── START BUTTON ─── */}
          <div className="start-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease 1.0s, transform 0.5s ease 1.0s' }}>
            <button onClick={handleStart} className="start-btn" style={{
              width: '100%', maxWidth: 400, padding: '16px 40px', borderRadius: 6,
              border: '1px solid rgba(212,168,67,0.5)',
              background: 'linear-gradient(135deg, #6b1010 0%, #8B1A1A 30%, #c0392b 60%, #8B1A1A 100%)',
              backgroundSize: '200% 200%',
              color: '#f0d080', fontSize: '1.05rem', letterSpacing: '0.12em',
              fontFamily: 'Noto Serif SC, serif', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.3s ease',
            }}>
              {matchType === 'pvc' ? 'START GAME' : matchType === 'pvp' ? 'START MATCH' : matchType === 'cvc' ? 'WATCH BATTLE' : 'OPEN BOARD'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
