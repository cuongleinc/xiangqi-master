import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { parseFen, isInCheck } from '@repo/xiangqi-core';
import { Color } from '@repo/shared';

export const StatusBar: React.FC = () => {
  const fen = useGameStore((s) => s.fen);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const status = useGameStore((s) => s.status);
  const error = useGameStore((s) => s.error);

  if (status !== 'playing') {
    const resultText =
      status === 'red_wins' ? 'Red Wins!' :
      status === 'black_wins' ? 'Black Wins!' :
      'Draw!';
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
    statusText = 'Engine thinking...';
    statusColor = 'text-gold animate-pulse';
  } else if (fen) {
    try {
      const parsed = parseFen(fen);
      const inCheck = isInCheck(parsed.board, parsed.turn);
      const turnText = parsed.turn === Color.RED ? 'Red' : 'Black';
      if (inCheck) {
        statusText = `${turnText} to move — Check!`;
        statusColor = 'text-red-chinese';
      } else {
        statusText = `${turnText} to move`;
      }
    } catch {
      statusText = 'Loading...';
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-lacquer border-t border-gold/30 py-2 px-4 text-center">
      <span className={`text-sm font-serif ${statusColor}`}>{statusText}</span>
    </div>
  );
};
