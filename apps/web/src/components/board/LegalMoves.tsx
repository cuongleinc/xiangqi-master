import React from 'react';
import { getPiece } from '@repo/xiangqi-core';

interface LegalMovesProps {
  legalMoves: [number, number][];
  board: Uint8Array;
  cellSize: number;
  padding: number;
}

export const LegalMoves: React.FC<LegalMovesProps> = ({ legalMoves, board, cellSize, padding }) => {
  const dots: React.ReactElement[] = [];

  for (const [row, col] of legalMoves) {
    const cx = padding + col * cellSize;
    const cy = padding + row * cellSize;
    const idx = row * 9 + col;
    const piece = getPiece(board, idx);

    if (piece !== 0) {
      dots.push(
        <circle
          key={`m${row}${col}`}
          cx={cx}
          cy={cy}
          r={cellSize * 0.46}
          fill="none"
          stroke="rgba(196,75,75,0.7)"
          strokeWidth={cellSize * 0.07}
        >
          <animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.8s" repeatCount="indefinite" />
        </circle>,
      );
    } else {
      dots.push(
        <circle
          key={`m${row}${col}`}
          cx={cx}
          cy={cy}
          r={cellSize * 0.14}
          fill="rgba(212,168,67,0.55)"
        />,
      );
    }
  }

  return <g>{dots}</g>;
};
