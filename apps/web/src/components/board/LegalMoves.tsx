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
      // Capture indicator: ring around the piece
      dots.push(
        <circle
          key={`m${row}${col}`}
          cx={cx}
          cy={cy}
          r={cellSize * 0.45}
          fill="none"
          stroke="rgba(255,0,0,0.6)"
          strokeWidth={cellSize * 0.06}
        />,
      );
    } else {
      // Move indicator: small dot
      dots.push(
        <circle
          key={`m${row}${col}`}
          cx={cx}
          cy={cy}
          r={cellSize * 0.15}
          fill="rgba(0,128,0,0.5)"
        />,
      );
    }
  }

  return <g>{dots}</g>;
};
