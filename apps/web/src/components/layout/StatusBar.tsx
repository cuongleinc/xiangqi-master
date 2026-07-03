import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game.store';
import { parseFen, isInCheck } from '@repo/xiangqi-core';
import { Color } from '@repo/shared';

export const StatusBar: React.FC = () => {
  const { t } = useTranslation();
  const fen = useGameStore((s) => s.fen);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const status = useGameStore((s) => s.status);
  const error = useGameStore((s) => s.error);

  if (status !== 'playing') {
    const resultText =
      status === 'red_wins' ? t('status.redWins') :
      status === 'black_wins' ? t('status.blackWins') :
      t('status.draw');
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-lacquer border-t border-gold/30 py-2 px-4 text-center">
        <span className="text-lg font-bold text-gold-light font-serif">{resultText}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-chinese/20 border-t border-red-chinese/50 py-2 px-4 text-center">
        <span className="text-sm text-red-chinese">{error}</span>
      </div>
    );
  }

  let statusText = '';
  let statusColor = 'text-cream-dim';

  if (isAiThinking) {
    statusText = t('status.engineThinking');
    statusColor = 'text-gold animate-pulse';
  } else if (fen) {
    try {
      const parsed = parseFen(fen);
      const inCheck = isInCheck(parsed.board, parsed.turn);
      const turnText = parsed.turn === Color.RED ? t('common.red') : t('common.black');
      if (inCheck) {
        statusText = t('status.check', { turn: turnText });
        statusColor = 'text-red-chinese';
      } else {
        statusText = t('status.toMove', { turn: turnText });
      }
    } catch {
      statusText = t('status.loading');
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-lacquer border-t border-gold/30 py-2 px-4 text-center">
      <span className={`text-sm font-serif ${statusColor}`}>{statusText}</span>
    </div>
  );
};
