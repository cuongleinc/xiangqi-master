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
  const radius = cellSize * 0.42;
  const cx = padding + col * cellSize;
  const cy = padding + row * cellSize;
  const char = info ? (PIECE_CHARS[info.color]?.[info.type] || '?') : '?';

  const fillColor = '#fce4b8';
  const strokeColor = isRed ? '#cc0000' : '#222222';
  const textColor = isRed ? '#cc0000' : '#222222';
  const fontSize = cellSize * 0.55;
  const strokeWidth = cellSize * 0.04;

  return (
    <g opacity={isDragging ? 0.5 : 1}>
      {/* Outer ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius + strokeWidth * 1.5}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth * 2}
      />
      {/* Piece body */}
      <circle
        cx={cx}
        cy={cy}
        r={radius}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
      {/* Inner ring */}
      <circle
        cx={cx}
        cy={cy}
        r={radius - strokeWidth * 2}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth * 0.8}
      />
      {/* Character */}
      <text
        x={cx}
        y={cy}
        fontSize={fontSize}
        fill={textColor}
        textAnchor="middle"
        dominantBaseline="central"
        fontWeight="bold"
        style={{ userSelect: 'none' }}
      >
        {char}
      </text>
      {/* Selection highlight */}
      {isSelected && (
        <circle
          cx={cx}
          cy={cy}
          r={radius + strokeWidth * 3}
          fill="none"
          stroke="#ffcc00"
          strokeWidth={strokeWidth * 2}
          strokeDasharray={`${cellSize * 0.15}, ${cellSize * 0.1}`}
        />
      )}
    </g>
  );
};
