import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game.store';

/**
 * StatusBar — only renders for game-over results or errors.
 * Turn indicators ("Red to move", "Engine thinking...") are intentionally
 * excluded because they're already shown in the sidebar (PvPInfoPanel /
 * ConnectionIndicator) and are visually obvious on the board itself.
 */
export const StatusBar: React.FC = () => {
  const { t } = useTranslation();
  const status = useGameStore((s) => s.status);
  const result = useGameStore((s) => s.result);
  const error = useGameStore((s) => s.error);

  // ── Game-over result ──
  if (status !== 'playing') {
    const resultText =
      status === 'red_wins' || result === 'red_wins' ? t('status.redWins') :
      status === 'black_wins' || result === 'black_wins' ? t('status.blackWins') :
      t('status.draw');
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-lacquer border-t border-gold/30 py-2 px-4 text-center z-10">
        <span className="text-lg font-bold text-gold-light font-serif">{resultText}</span>
      </div>
    );
  }

  // ── Error ──
  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-chinese/20 border-t border-red-chinese/50 py-2 px-4 text-center z-10">
        <span className="text-sm text-red-chinese">{error}</span>
      </div>
    );
  }

  // ── Normal gameplay — nothing to show (turn is indicated in sidebars) ──
  return null;
};
