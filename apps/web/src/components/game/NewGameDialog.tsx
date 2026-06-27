import React, { useEffect, useState } from 'react';
import { useGameStore } from '../../stores/game.store';
import { useUiStore } from '../../stores/ui.store';
import { useSettingsStore } from '../../stores/settings.store';

interface NewGameDialogProps {
  isInitial?: boolean;
}

const difficulties = [
  { value: 'easy', zh: '初級', en: 'Beginner', time: '0.1s', timeLabel: '100ms' },
  { value: 'medium', zh: '中級', en: 'Intermediate', time: '0.5s', timeLabel: '500ms' },
  { value: 'hard', zh: '高級', en: 'Advanced', time: '1.5s', timeLabel: '1.5s' },
  { value: 'expert', zh: '專家', en: 'Expert', time: '5s', timeLabel: '5.0s' },
];

export const NewGameDialog: React.FC<NewGameDialogProps> = ({ isInitial }) => {
  const createNewGame = useGameStore((s) => s.createNewGame);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const setDifficulty = useSettingsStore((s) => s.setDifficulty);
  const [visible, setVisible] = useState(false);

  useEffect(() => { setVisible(true); }, []);

  const handleStart = async () => {
    await createNewGame(difficulty);
    closeDialog();
  };

  if (!isInitial) {
    // In-game dialog — keep compact
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="bg-lacquer border border-gold/40 rounded-xl p-6 max-w-sm mx-auto">
          <h2 className="text-xl font-bold text-gold-light font-serif mb-2 text-center">New Game</h2>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {difficulties.map((d) => (
              <button key={d.value} onClick={() => setDifficulty(d.value)} className={`p-3 rounded-lg text-left transition-all border ${difficulty === d.value ? 'bg-gold text-ebony border-gold' : 'bg-lacquer/50 text-cream-dim border-gold/20 hover:border-gold/50'}`}>
                <div className="font-medium text-sm">{d.zh}</div>
                <div className="text-[10px] opacity-70">{d.en}</div>
              </button>
            ))}
          </div>
          <button onClick={handleStart} className="w-full bg-gold hover:bg-gold-light text-ebony font-bold py-3 rounded-lg font-serif tracking-wide">Play</button>
        </div>
      </div>
    );
  }

  // Welcome screen — epic intro
  return (
    <div
      className="min-h-screen relative overflow-hidden flex items-center justify-center"
      style={{
        background: `
          radial-gradient(ellipse at 50% 0%, rgba(120,60,10,0.4) 0%, transparent 60%),
          radial-gradient(ellipse at 20% 100%, rgba(80,30,5,0.3) 0%, transparent 50%),
          #0d0800
        `,
      }}
    >
      {/* Decorative watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ zIndex: 0 }}
      >
        <span className="font-serif text-gold" style={{ fontSize: '40vw', opacity: 0.03 }}>象</span>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: i % 2 === 0 ? '#d4a843' : '#a07840',
              opacity: 0.04 + Math.random() * 0.06,
              left: `${10 + Math.random() * 80}%`,
              bottom: `-${5 + Math.random() * 10}%`,
              animation: `floatUp ${8 + Math.random() * 8}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div
        className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 w-full max-w-[1100px] mx-auto px-6 py-12"
        style={{ zIndex: 1, opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
      >
        {/* LEFT — Title + art */}
        <div
          className="lg:w-[40%] text-center lg:text-left flex-shrink-0"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(-20px)',
            transition: 'opacity 0.6s ease, transform 0.6s ease',
          }}
        >
          <h1
            className="font-serif leading-none mb-3 animate-shimmer"
            style={{ fontSize: '5rem', color: '#d4a843' }}
          >
            象棋
          </h1>
          <p
            className="font-serif mb-6"
            style={{ fontSize: '1.2rem', color: '#a07840', letterSpacing: '0.2em' }}
          >
            XIANGQI MASTER
          </p>

          {/* Decorative line */}
          <div className="flex items-center justify-center lg:justify-start gap-3 mb-6">
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, transparent, #8B6914)' }} />
            <span className="text-gold-dim text-xs">◆</span>
            <div className="h-px flex-1 max-w-[60px]" style={{ background: 'linear-gradient(90deg, #8B6914, transparent)' }} />
          </div>

          <p
            className="text-sm italic mb-8 lg:max-w-[300px] mx-auto lg:mx-0"
            style={{ color: '#7a5c30', lineHeight: 1.6 }}
          >
            The ancient game of strategy and wisdom.
            Challenge the AI engine in the battle of the mind.
          </p>

          {/* Mini piece preview */}
          <div className="flex items-center justify-center lg:justify-start gap-3">
            <span className="inline-block w-5 h-5 rounded-full bg-red-chinese/60 border border-gold/30" />
            <span className="inline-block w-5 h-5 rounded-full bg-red-chinese/60 border border-gold/30" />
            <span className="inline-block w-5 h-5 rounded-full bg-red-chinese/60 border border-gold/30" />
          </div>
        </div>

        {/* RIGHT — Difficulty card */}
        <div
          className="lg:w-[60%] w-full max-w-[480px]"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateX(0)' : 'translateX(20px)',
            transition: 'opacity 0.6s ease 0.15s, transform 0.6s ease 0.15s',
          }}
        >
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(30,15,5,0.85)',
              border: '1px solid #3d2010',
              backdropFilter: 'blur(4px)',
            }}
          >
            <h3 className="text-center font-serif text-gold text-lg mb-1 tracking-wider">
              選擇難度 · Difficulty
            </h3>
            <div className="w-16 mx-auto mb-5 border-t border-gold/30" />

            <div className="grid grid-cols-2 gap-3 mb-6">
              {difficulties.map((d) => (
                <button
                  key={d.value}
                  onClick={() => setDifficulty(d.value)}
                  className="p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    border: `1.5px solid ${difficulty === d.value ? '#d4a843' : '#3d2010'}`,
                    background: difficulty === d.value ? '#3d1a00' : '#150c00',
                    boxShadow: difficulty === d.value ? '0 0 12px rgba(212,168,67,0.2)' : 'none',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-serif text-cream text-base" style={{ color: difficulty === d.value ? '#f0d080' : '#a89880' }}>
                      {d.zh}
                    </span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded font-mono"
                      style={{
                        background: difficulty === d.value ? 'rgba(212,168,67,0.15)' : 'rgba(61,32,16,0.5)',
                        color: difficulty === d.value ? '#d4a843' : '#8b6914',
                      }}
                    >
                      {d.timeLabel}
                    </span>
                  </div>
                  <div className="text-[11px] opacity-60" style={{ color: '#a89880' }}>{d.en}</div>
                </button>
              ))}
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 rounded-lg font-bold font-serif tracking-[0.1em] text-lg transition-all duration-200"
              style={{
                background: 'linear-gradient(135deg, #8B1A1A, #c0392b)',
                color: '#f0d080',
                letterSpacing: '0.1em',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(192,57,43,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              開始對局 · Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
