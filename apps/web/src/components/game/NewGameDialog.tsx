import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { useUiStore } from '../../stores/ui.store';
import { useSettingsStore } from '../../stores/settings.store';

interface NewGameDialogProps {
  isInitial?: boolean;
}

export const NewGameDialog: React.FC<NewGameDialogProps> = ({ isInitial }) => {
  const createNewGame = useGameStore((s) => s.createNewGame);
  const closeDialog = useUiStore((s) => s.closeDialog);
  const difficulty = useSettingsStore((s) => s.difficulty);
  const setDifficulty = useSettingsStore((s) => s.setDifficulty);

  const handleStart = async () => {
    await createNewGame(difficulty);
    closeDialog();
  };

  const difficulties = [
    { value: 'easy', label: 'Easy', desc: '100ms' },
    { value: 'medium', label: 'Medium', desc: '500ms' },
    { value: 'hard', label: 'Hard', desc: '1.5s' },
    { value: 'expert', label: 'Expert', desc: '5s' },
  ];

  return (
    <div className={`${isInitial ? '' : 'fixed inset-0 bg-black/60 flex items-center justify-center z-50'}`}>
      <div className="bg-lacquer border border-gold/40 rounded-xl p-6 max-w-sm mx-auto shadow-2xl" style={{ boxShadow: '0 0 40px rgba(212,168,67,0.1)' }}>
        <h2 className="text-xl font-bold text-gold-light font-serif mb-2 text-center">
          {isInitial ? 'Welcome to Xiangqi Master' : 'New Game'}
        </h2>
        <p className="text-cream-dim text-xs text-center mb-5 font-serif">中國象棋</p>

        <div className="space-y-2 mb-5">
          <label className="text-cream-dim text-xs font-serif tracking-wide uppercase">Difficulty</label>
          <div className="grid grid-cols-2 gap-2">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`p-3 rounded-lg text-left transition-all duration-200 border ${
                  difficulty === d.value
                    ? 'bg-gold text-ebony border-gold font-bold'
                    : 'bg-lacquer/50 text-cream-dim border-gold/20 hover:border-gold/50 hover:text-cream'
                }`}
              >
                <div className="font-medium text-sm">{d.label}</div>
                <div className="text-[10px] opacity-70">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-gold hover:bg-gold-light text-ebony font-bold py-3 px-4 rounded-lg transition-all duration-200 font-serif tracking-wide"
        >
          {isInitial ? 'Start Game' : 'Play'}
        </button>
      </div>
    </div>
  );
};
