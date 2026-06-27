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
      <div className="fixed bottom-0 left-0 right-0 bg-[#16213e] border-t border-gray-700 py-2 px-4 text-center">
        <span className="text-lg font-bold text-yellow-400">{resultText}</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed bottom-0 left-0 right-0 bg-red-900 border-t border-red-700 py-2 px-4 text-center">
        <span className="text-sm text-red-200">{error}</span>
      </div>
    );
  }

  let statusText = '';
  let statusColor = 'text-gray-300';

  if (isAiThinking) {
    statusText = 'Engine thinking...';
    statusColor = 'text-yellow-400 animate-pulse';
  } else if (fen) {
    try {
      const parsed = parseFen(fen);
      const inCheck = isInCheck(parsed.board, parsed.turn);
      const turnText = parsed.turn === Color.RED ? 'Red' : 'Black';
      if (inCheck) {
        statusText = `${turnText} to move — Check!`;
        statusColor = 'text-red-400';
      } else {
        statusText = `${turnText} to move`;
      }
    } catch {
      statusText = 'Loading...';
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#16213e] border-t border-gray-700 py-2 px-4 text-center">
      <span className={`text-sm ${statusColor}`}>{statusText}</span>
    </div>
  );
};
