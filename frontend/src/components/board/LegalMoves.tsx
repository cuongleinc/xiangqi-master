import React from 'react';
import { getPiece } from '@repo/xiangqi-core';
import { colToX, rowToY } from './coords';

interface LegalMovesProps {
  legalMoves: [number, number][];
  board: Uint8Array;
  cellSize: number;
  padding: number;
}

export const LegalMoves: React.FC<LegalMovesProps> = ({ legalMoves, board, cellSize, padding }) => {
  const dots: React.ReactElement[] = [];
  const r = cellSize * 0.18; // dot radius — ~12.6px at 70px cell, up from 0.14

  for (const [row, col] of legalMoves) {
    const cx = colToX(col, cellSize, padding);
    const cy = rowToY(row, cellSize, padding);
    const idx = row * 9 + col;
    const piece = getPiece(board, idx);

    if (piece !== 0) {
      // Capture indicator — thick animated ring around the target piece
      dots.push(
        <g key={`m${row}${col}`}>
          {/* Outer pulse ring */}
          <circle
            cx={cx}
            cy={cy}
            r={cellSize * 0.44}
            fill="none"
            stroke="#f0d080"
            strokeWidth={cellSize * 0.06}
            opacity={0.8}
          >
            <animate attributeName="opacity" values="0.8;0.3;0.8" dur="0.9s" repeatCount="indefinite" />
            <animate attributeName="r" values={`${cellSize * 0.44};${cellSize * 0.48};${cellSize * 0.44}`} dur="0.9s" repeatCount="indefinite" />
          </circle>
          {/* Inner solid ring */}
          <circle
            cx={cx}
            cy={cy}
            r={cellSize * 0.42}
            fill="none"
            stroke="#d4a843"
            strokeWidth={cellSize * 0.05}
            opacity={0.9}
          />
          {/* Capture icon — four small corner marks */}
          {[-1, 1].flatMap((sx) =>
            [-1, 1].map((sy) => (
              <line
                key={`x${sx}${sy}`}
                x1={cx + sx * cellSize * 0.28}
                y1={cy + sy * cellSize * 0.28}
                x2={cx + sx * cellSize * 0.36}
                y2={cy + sy * cellSize * 0.28}
                stroke="#f0d080"
                strokeWidth={cellSize * 0.04}
                strokeLinecap="round"
                opacity={0.7}
              />
            )),
          )}
          {[-1, 1].flatMap((sx) =>
            [-1, 1].map((sy) => (
              <line
                key={`y${sx}${sy}`}
                x1={cx + sx * cellSize * 0.28}
                y1={cy + sy * cellSize * 0.28}
                x2={cx + sx * cellSize * 0.28}
                y2={cy + sy * cellSize * 0.36}
                stroke="#f0d080"
                strokeWidth={cellSize * 0.04}
                strokeLinecap="round"
                opacity={0.7}
              />
            )),
          )}
        </g>,
      );
    } else {
      // Empty-square move indicator — solid gold dot with dark outline for contrast
      dots.push(
        <g key={`m${row}${col}`}>
          {/* Dark outline for contrast on light wood */}
          <circle
            cx={cx}
            cy={cy}
            r={r + cellSize * 0.025}
            fill="rgba(0,0,0,0.35)"
          />
          {/* Main gold dot */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="rgba(240,208,128,0.85)"
          />
          {/* Inner highlight */}
          <circle
            cx={cx - r * 0.2}
            cy={cy - r * 0.25}
            r={r * 0.45}
            fill="rgba(255,240,210,0.5)"
          />
        </g>,
      );
    }
  }

  return <g>{dots}</g>;
};
