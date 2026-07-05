import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game.store';
import { useUiStore } from '../../stores/ui.store';
import { useSettingsStore } from '../../stores/settings.store';
import { LanguageSwitcher } from '../layout/LanguageSwitcher';
import { MusicToggle } from '../layout/MusicToggle';
import type { MatchType } from '@repo/shared';

interface NewGameDialogProps {
  isInitial?: boolean;
}

const MATCH_TYPE_KEYS = ['pvc', 'pvp', 'cvc', 'analysis'] as const;

const MATCH_TYPE_ICONS: Record<string, string> = {
  pvc: '⚔️',
  pvp: '👥',
  cvc: '🤖',
  analysis: '🔍',
};

const DIFFICULTY_KEYS = ['easy', 'medium', 'hard', 'expert'] as const;

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
  const { t } = useTranslation();
  const createNewGame = useGameStore((s) => s.createNewGame);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const setDifficulty = useSettingsStore((s) => s.setDifficulty);
  const matchType = useSettingsStore((s) => s.matchType);
  const setMatchType = useSettingsStore((s) => s.setMatchType);
  const openDialog = useUiStore((s) => s.openDialog);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  const showDifficulty = matchType === 'pvc' || matchType === 'cvc';

  const handleStart = async () => {
    if (matchType === 'pvp') {
      // Route PvP through matchmaking
      closeDialog();
      const { usePvPStore } = await import('../../stores/pvp.store');
      usePvPStore.getState().joinQueue();
    } else {
      await createNewGame(difficulty, matchType);
      closeDialog();
    }
  };

  // ─── Helpers to build localized labels from i18n keys ───
  const getMatchLabel = (mt: string) => t(`newGame.matchType.${mt}.label`);
  const getMatchChinese = (mt: string) => t(`newGame.matchType.${mt}.chinese`);
  const getMatchDesc = (mt: string) => t(`newGame.matchType.${mt}.desc`);
  const getDiffLabel = (d: string) => t(`newGame.difficulty.${d}.label`);
  const getDiffChinese = (d: string) => t(`newGame.difficulty.${d}.chinese`);
  const getDiffTime = (d: string) => t(`newGame.difficulty.${d}.time`);

  const startLabel = t(`newGame.start.${matchType}`);

  // ─── In-game compact dialog ───
  if (!isInitial) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-lacquer border border-gold/40 rounded-xl p-6 max-w-sm mx-auto">
          <h2 className="text-xl font-bold text-gold-light font-serif mb-2 text-center">{t('newGame.heading')}</h2>
          {/* Match type */}
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {MATCH_TYPE_KEYS.map((mt) => (
              <button key={mt} onClick={() => setMatchType(mt)} className={`p-2 rounded-md text-left transition-all border text-xs ${matchType === mt ? 'bg-gold/20 border-gold text-gold-light' : 'bg-lacquer/50 text-cream-dim border-gold/20 hover:border-gold/50'}`}>
                <div className="font-medium">{MATCH_TYPE_ICONS[mt]} {getMatchLabel(mt)}</div>
              </button>
            ))}
          </div>
          {/* Difficulty (only for PvC and CvC) */}
          {showDifficulty && (
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {DIFFICULTY_KEYS.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)} className={`p-2.5 rounded-lg text-left transition-all border ${difficulty === d ? 'bg-gold text-ebony border-gold' : 'bg-lacquer/50 text-cream-dim border-gold/20 hover:border-gold/50'}`}>
                  <div className="font-medium text-xs">{getDiffLabel(d)}</div><div className="text-[9px] opacity-70">{getDiffChinese(d)}</div>
                </button>
              ))}
            </div>
          )}
          <button onClick={handleStart} className="w-full bg-gold hover:bg-gold-light text-ebony font-bold py-2.5 rounded-lg font-serif tracking-wide text-sm">{t('newGame.play')}</button>
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

      {/* ─── Music Toggle + Language Switcher + About (top-right, always visible) ─── */}
      <div style={{ position: 'absolute', top: 24, right: 28, zIndex: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
        <MusicToggle />
        <button
          onClick={() => openDialog('about')}
          className="text-xs text-cream-dim/50 hover:text-gold-light transition-colors font-serif tracking-wide"
        >
          {t('header.about')}
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 2,
          background: 'rgba(15,8,2,0.85)', border: '1px solid rgba(212,168,67,0.18)',
          borderRadius: 24, padding: '4px 6px',
          backdropFilter: 'blur(12px)',
        }}>
          <LanguageSwitcher />
        </div>
      </div>

      {/* ═══════════════════════════════════════
           MAIN CONTENT
           ═══════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 10, padding: '3rem 2rem',
      }}>
        <div style={{
          width: 'min(720px, 92vw)', textAlign: 'center' as const,
          opacity: mounted ? 1 : 0, transition: 'opacity 0.3s',
        }}>
          {/* ─── TITLE ─── */}
          <div className="title-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(-30px)', transition: 'opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s' }}>

            {/* ─── SUBTITLE ─── */}
            <div className="subtitle-section" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.4s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 22 }}>
              <div style={{ flex: 1, maxWidth: 100, height: 1, background: '#3d2010' }} />
              <span style={{ fontSize: '2.6rem', letterSpacing: '0.38em', color: '#d4b870', fontFamily: 'Noto Serif SC, serif', whiteSpace: 'nowrap', fontWeight: 600 }}>{t('newGame.title')}</span>
              <div style={{ flex: 1, maxWidth: 100, height: 1, background: '#3d2010' }} />
            </div>

            {/* ─── LORE TAGLINE ─── */}
            <div className="lore-section" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease 0.6s', marginBottom: 36 }}>
              <p style={{ fontFamily: 'Noto Serif SC, serif', fontSize: '1.1rem', color: '#b89560', fontStyle: 'italic', lineHeight: 2.2, margin: '0 0 2px 0' }}>{t('newGame.taglineLine1')}</p>
              <p style={{ fontFamily: 'Noto Serif SC, serif', fontSize: '1.1rem', color: '#b89560', fontStyle: 'italic', lineHeight: 2.2, margin: 0 }}>{t('newGame.taglineLine2')}</p>
            </div>
          </div>

          {/* ─── MATCH TYPE ─── */}
          <div className="matchtype-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease 0.7s, transform 0.5s ease 0.7s' }}>
            <p style={{ fontSize: '0.85rem', letterSpacing: '0.22em', color: '#c4a060', fontFamily: 'Noto Serif SC, serif', marginBottom: 16, fontWeight: 600 }}>{t('newGame.section.matchType')}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 40 }}>
              {MATCH_TYPE_KEYS.map((mt) => {
                const active = matchType === mt;
                return (
                  <button key={mt} onClick={() => setMatchType(mt)} className="match-card" style={{
                    background: active ? 'rgba(60,25,5,0.9)' : 'rgba(20,10,2,0.7)',
                    border: active ? '1.5px solid #d4a843' : '1px solid #2d1505',
                    borderRadius: 10, padding: '18px 20px', cursor: 'pointer', textAlign: 'left' as const,
                    transition: 'all 0.25s ease',
                    backdropFilter: 'blur(8px)',
                    boxShadow: active ? '0 0 0 1px rgba(212,168,67,0.2), inset 0 0 20px rgba(212,168,67,0.05), 0 8px 30px rgba(0,0,0,0.5)' : 'none',
                    display: 'flex', alignItems: 'center', gap: 14,
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = 'rgba(212,168,67,0.5)';
                      e.currentTarget.style.boxShadow = '0 0 0 1px rgba(212,168,67,0.1), 0 4px 16px rgba(0,0,0,0.3)';
                      e.currentTarget.style.transform = 'scale(1.02)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = '#2d1505';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'scale(1)';
                    }
                  }}
                  >
                    <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{MATCH_TYPE_ICONS[mt]}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: active ? '#f0d080' : '#d4c5a0', fontFamily: 'Noto Serif SC, serif' }}>{getMatchLabel(mt)}</div>
                      <div style={{ fontSize: '0.7rem', color: '#8a7550', letterSpacing: '0.05em', marginTop: 2 }}>{getMatchDesc(mt)}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ─── DIFFICULTY (only PvC and CvC) ─── */}
          {showDifficulty && (
            <div className="difficulty-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease 0.85s, transform 0.5s ease 0.85s' }}>
              <p style={{ fontSize: '0.8rem', letterSpacing: '0.2em', color: '#b89560', fontFamily: 'Noto Serif SC, serif', marginBottom: 14, fontWeight: 600 }}>{t('newGame.section.difficulty')}</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36 }}>
                {DIFFICULTY_KEYS.map((d) => {
                  const active = difficulty === d;
                  return (
                    <button key={d} onClick={() => setDifficulty(d)} className="diff-card" style={{
                      background: active ? 'rgba(60,25,5,0.9)' : 'rgba(20,10,2,0.7)',
                      border: active ? '1.5px solid #d4a843' : '1px solid #2d1505',
                      borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left' as const,
                      transition: 'all 0.25s ease',
                      backdropFilter: 'blur(8px)',
                      boxShadow: active ? '0 0 0 1px rgba(212,168,67,0.2), inset 0 0 20px rgba(212,168,67,0.05), 0 8px 30px rgba(0,0,0,0.5)' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = 'rgba(212,168,67,0.5)';
                        e.currentTarget.style.boxShadow = '0 0 0 1px rgba(212,168,67,0.1), 0 4px 16px rgba(0,0,0,0.3)';
                        e.currentTarget.style.transform = 'scale(1.02)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.borderColor = '#2d1505';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.transform = 'scale(1)';
                      }
                    }}
                    >
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 600, color: active ? '#f0d080' : '#d4c5a0', fontFamily: 'Noto Serif SC, serif' }}>{getDiffLabel(d)}</div>
                        <div style={{ fontSize: '0.65rem', color: '#b89560', letterSpacing: '0.1em', marginTop: 2 }}>{getDiffChinese(d)}</div>
                      </div>
                      <span style={{ fontSize: '0.65rem', color: '#6b4c1a', background: '#1a0f00', padding: '3px 10px', borderRadius: 20, border: '1px solid #3d2010', fontFamily: 'monospace', flexShrink: 0 }}>{getDiffTime(d)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─── START BUTTON ─── */}
          <div className="start-section" style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 0.5s ease 1.0s, transform 0.5s ease 1.0s' }}>
            <button onClick={handleStart} className="start-btn" style={{
              width: '100%', maxWidth: 420, padding: '18px 48px', borderRadius: 8,
              border: '1px solid rgba(212,168,67,0.5)',
              background: 'linear-gradient(135deg, #6b1010 0%, #8B1A1A 30%, #c0392b 60%, #8B1A1A 100%)',
              backgroundSize: '200% 200%',
              color: '#f0d080', fontSize: '1.15rem', letterSpacing: '0.15em',
              fontFamily: 'Noto Serif SC, serif', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.3s ease',
              boxShadow: '0 4px 24px rgba(139,26,26,0.35)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = 'brightness(1.15)';
              e.currentTarget.style.boxShadow = '0 6px 32px rgba(139,26,26,0.5)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = 'brightness(1)';
              e.currentTarget.style.boxShadow = '0 4px 24px rgba(139,26,26,0.35)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            >
              {startLabel}
            </button>
          </div>

        </div>
      </div>

      {/* ─── Author Footer ─── */}
      <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', zIndex: 20 }}>
        <span className="text-cream-dim/40 text-[13px] font-serif">
          &copy; {new Date().getFullYear()}{' '}
          <a
            href="https://github.com/cuongleinc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors"
          >
            Cuong Le
          </a>
          {' — '}{t('footer.tagline')}
        </span>
      </div>
    </div>
  );
};
