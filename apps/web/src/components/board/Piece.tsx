import React from 'react';
import { getPieceInfo } from '@repo/xiangqi-core';
import { Color, PIECE_CHARS } from '@repo/shared';

interface PieceProps {
  pieceCode: number;
  row: number;
  col: number;
  cellSize: number;
  padding: number;
  isSelected: boolean;
  isDragging?: boolean;
}

export const Piece: React.FC<PieceProps> = ({ pieceCode, row, col, cellSize, padding, isSelected, isDragging }) => {
  const info = getPieceInfo(pieceCode);
  if (!info) return null;

  const isRed = info.color === Color.RED;
  const radius = cellSize * 0.43;
  const cx = padding + col * cellSize;
  const cy = padding + row * cellSize;
  const char = PIECE_CHARS[info.color]?.[info.type] || '?';

  const bodyFill = isRed ? '#6b2020' : '#2a1a0a';
  const strokeColor = '#d4a843';
  const textColor = '#f5e6c8';
  const fontSize = cellSize * 0.55;
  const strokeWidth = cellSize * 0.035;

  return (
    <g opacity={isDragging ? 0.4 : 1}>
      {/* Drop shadow */}
      <circle cx={cx + strokeWidth} cy={cy + strokeWidth} r={radius + strokeWidth * 2} fill="rgba(0,0,0,0.4)" />
      {/* Outer gold ring */}
      <circle cx={cx} cy={cy} r={radius + strokeWidth * 1.8} fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 2.5} />
      {/* Inner gold ring */}
      <circle cx={cx} cy={cy} r={radius + strokeWidth * 0.5} fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.8} opacity={0.6} />
      {/* Body */}
      <circle cx={cx} cy={cy} r={radius} fill={bodyFill} stroke={strokeColor} strokeWidth={strokeWidth} />
      {/* Subtle inner gradient effect — solid ring */}
      <circle cx={cx} cy={cy} r={radius - strokeWidth * 2.5} fill="none" stroke={strokeColor} strokeWidth={strokeWidth * 0.5} opacity={0.3} />
      {/* Character */}
      <text x={cx} y={cy} fontSize={fontSize} fill={textColor} textAnchor="middle" dominantBaseline="central" fontWeight="bold" fontFamily="Noto Serif SC, serif" style={{ userSelect: 'none', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>{char}</text>
      {/* Selection glow */}
      {isSelected && (
        <>
          <circle cx={cx} cy={cy} r={radius + strokeWidth * 4} fill="none" stroke="#f0d080" strokeWidth={strokeWidth * 2} opacity={0.7}>
            <animate attributeName="opacity" values="0.7;0.2;0.7" dur="1.2s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={radius + strokeWidth * 1.5} fill="none" stroke="#d4a843" strokeWidth={strokeWidth * 3} opacity={0.9} />
        </>
      )}
    </g>
  );
};
