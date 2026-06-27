import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { useUiStore } from '../../stores/ui.store';

export const GameOverDialog: React.FC = () => {
  const status = useGameStore((s) => s.status);
  const createNewGame = useGameStore((s) => s.createNewGame);
  const difficulty = useGameStore((s) => s.difficulty);
  const openDialog = useUiStore((s) => s.openDialog);

  const resultText =
    status === 'red_wins' ? '🏆 Red Wins!' :
    status === 'black_wins' ? '🏆 Black Wins!' :
    '🤝 Draw!';

  const handleNewGame = async () => {
    await createNewGame(difficulty);
  };

  const handleReview = () => {
    openDialog('review');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#16213e] rounded-xl p-6 max-w-sm mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{resultText}</h2>
        <p className="text-gray-400 text-sm mb-6">Game Over</p>

        <div className="space-y-2">
          <button
            onClick={handleNewGame}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Play Again
          </button>
          <button
            onClick={handleReview}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Review Game
          </button>
        </div>
      </div>
    </div>
  );
};
