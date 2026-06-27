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
    { value: 'easy', label: 'Easy', desc: '100ms think time' },
    { value: 'medium', label: 'Medium', desc: '500ms think time' },
    { value: 'hard', label: 'Hard', desc: '1.5s think time' },
    { value: 'expert', label: 'Expert', desc: '5s think time' },
  ];

  return (
    <div className={`${isInitial ? '' : 'fixed inset-0 bg-black/50 flex items-center justify-center z-50'}`}>
      <div className="bg-[#16213e] rounded-xl p-6 max-w-sm mx-auto">
        <h2 className="text-xl font-bold text-white mb-4">
          {isInitial ? 'Welcome to Xiangqi Master' : 'New Game'}
        </h2>

        <div className="space-y-3 mb-6">
          <label className="text-sm text-gray-400">Difficulty</label>
          <div className="grid grid-cols-2 gap-2">
            {difficulties.map((d) => (
              <button
                key={d.value}
                onClick={() => setDifficulty(d.value)}
                className={`p-3 rounded-lg text-left transition-colors ${
                  difficulty === d.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
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
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
        >
          {isInitial ? 'Start Game' : 'Play'}
        </button>
      </div>
    </div>
  );
};
