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
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-lacquer border border-gold/40 rounded-xl p-6 max-w-sm mx-auto text-center shadow-2xl" style={{ boxShadow: '0 0 40px rgba(212,168,67,0.1)' }}>
        <h2 className="text-2xl font-bold text-gold-light font-serif mb-2">{resultText}</h2>
        <p className="text-cream-dim text-sm mb-6 font-serif">Game Over</p>

        <div className="space-y-2">
          <button
            onClick={handleNewGame}
            className="w-full bg-gold hover:bg-gold-light text-ebony font-bold py-2 px-4 rounded-lg transition-all duration-200 font-serif tracking-wide"
          >
            Play Again
          </button>
          <button
            onClick={handleReview}
            className="w-full bg-lacquer border border-gold/30 hover:border-gold/60 text-cream font-medium py-2 px-4 rounded-lg transition-all duration-200"
          >
            Review Game
          </button>
        </div>
      </div>
    </div>
  );
};
