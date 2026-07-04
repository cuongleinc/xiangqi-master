import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game.store';
import { useUiStore } from '../../stores/ui.store';

/** Map status/result to the correct i18n key, falling back gracefully. */
function resultKey(status: string, result: string | null): string {
  if (status === 'red_wins' || result === 'red_wins') return 'gameOver.redWins';
  if (status === 'black_wins' || result === 'black_wins') return 'gameOver.blackWins';
  if (status === 'draw' || result === 'draw') return 'gameOver.draw';
  // Defensive fallback — if status is an unexpected value, use result
  if (result === 'red_wins' || result === 'black_wins' || result === 'draw') return `gameOver.${result === 'red_wins' ? 'redWins' : result === 'black_wins' ? 'blackWins' : 'draw'}` as const;
  return 'gameOver.draw';
}

export const GameOverDialog: React.FC = () => {
  const { t } = useTranslation();
  const status = useGameStore((s) => s.status);
  const result = useGameStore((s) => s.result);
  const createNewGame = useGameStore((s) => s.createNewGame);
  const difficulty = useGameStore((s) => s.difficulty);
  const moveCount = useGameStore((s) => s.moveCount);
  const showConfirm = useUiStore((s) => s.showConfirm);

  const resultText = t(resultKey(status, result));

  const handleNewGame = () => {
    if (moveCount > 0) {
      showConfirm(t('confirm.newGame'), () => createNewGame(difficulty));
    } else {
      createNewGame(difficulty);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-lacquer border border-gold/40 rounded-xl p-6 max-w-sm mx-auto text-center shadow-2xl" style={{ boxShadow: '0 0 40px rgba(212,168,67,0.1)' }}>
        <h2 className="text-2xl font-bold text-gold-light font-serif mb-2">{resultText}</h2>
        <p className="text-cream-dim text-sm mb-6 font-serif">{t('gameOver.subtitle')}</p>

        <button
          onClick={handleNewGame}
          className="w-full bg-gold hover:bg-gold-light text-ebony font-bold py-2 px-4 rounded-lg transition-all duration-200 font-serif tracking-wide"
        >
          {t('gameOver.playAgain')}
        </button>
      </div>
    </div>
  );
};
