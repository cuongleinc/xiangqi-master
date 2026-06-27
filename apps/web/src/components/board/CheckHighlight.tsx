import React from 'react';
import { parseFen, findKing, isInCheck } from '@repo/xiangqi-core';

interface CheckHighlightProps {
  fen: string | null;
  cellSize: number;
  padding: number;
}

export const CheckHighlight: React.FC<CheckHighlightProps> = ({ fen, cellSize, padding }) => {
  if (!fen) return null;

  const parsed = parseFen(fen);
  const turn = parsed.turn;

  if (!isInCheck(parsed.board, turn)) return null;

  const kingPos = findKing(parsed.board, turn);
  if (kingPos === null) return null;

  const row = Math.floor(kingPos / 9);
  const col = kingPos % 9;
  const cx = padding + col * cellSize;
  const cy = padding + row * cellSize;
  const r = cellSize * 0.52;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="#c44b4b"
      strokeWidth={cellSize * 0.07}
      opacity={0.8}
    >
      <animate attributeName="opacity" values="0.8;0.2;0.8" dur="0.7s" repeatCount="indefinite" />
    </circle>
  );
};
