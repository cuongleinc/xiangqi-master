import React from 'react';
import { parseFen, findKing, indexFromRowCol, rowColFromIndex } from '@repo/xiangqi-core';
import { isInCheck } from '@repo/xiangqi-core';
import { Color } from '@repo/shared';

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

  const [row, col] = rowColFromIndex(kingPos);
  const cx = padding + col * cellSize;
  const cy = padding + row * cellSize;
  const r = cellSize * 0.5;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={r}
      fill="none"
      stroke="red"
      strokeWidth={cellSize * 0.06}
      opacity={0.7}
    >
      <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1s" repeatCount="indefinite" />
    </circle>
  );
};
