import React, { useState } from 'react';
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

const MOVE_EASING = 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)';
const HOVER_EASING = 'transform 0.15s ease-out';

export const Piece: React.FC<PieceProps> = ({ pieceCode, row, col, cellSize, padding, isSelected, isDragging }) => {
  const [isHovered, setIsHovered] = useState(false);
  const info = getPieceInfo(pieceCode);
  if (!info) return null;

  const isRed = info.color === Color.RED;
  const char = PIECE_CHARS[info.color]?.[info.type] || '?';

  const radius = cellSize * 0.43;
  const cx = padding + col * cellSize;
  const cy = padding + row * cellSize;
  const fontSize = cellSize * 0.55;
  const strokeWidth = cellSize * 0.04;
  const gradId = `piece-${pieceCode}-${row}-${col}`;

  // Red piece colors
  const redGradStart = '#ff6b35';
  const redGradEnd = '#8B1A1A';
  const redOuterStroke = '#5a0f0f';
  const redInnerStroke = 'rgba(255,200,150,0.4)';
  const redTextColor = '#ffe0d0';

  // Black piece colors
  const blackGradStart = '#444';
  const blackGradEnd = '#0d0d0d';
  const blackOuterStroke = '#1a1a1a';
  const blackInnerStroke = 'rgba(180,160,120,0.25)';
  const blackTextColor = '#d4c5a0';

  const gradStart = isRed ? redGradStart : blackGradStart;
  const gradEnd = isRed ? redGradEnd : blackGradEnd;
  const outerStroke = isRed ? redOuterStroke : blackOuterStroke;
  const innerStroke = isRed ? redInnerStroke : blackInnerStroke;
  const textColor = isRed ? redTextColor : blackTextColor;

  const hoverScale = isHovered && !isDragging ? 1.08 : 1;

  return (
    <g
      style={{
        transition: MOVE_EASING,
        cursor: 'pointer',
      }}
      transform={`translate(${cx}, ${cy})`}
      opacity={isDragging ? 0.4 : 1}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hover scale wrapper */}
      <g
        style={{ transition: HOVER_EASING, transformOrigin: '0px 0px' }}
        transform={`scale(${hoverScale})`}
      >
        <defs>
          <radialGradient id={gradId} cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor={gradStart} />
            <stop offset="100%" stopColor={gradEnd} />
          </radialGradient>
        </defs>

        {/* Drop shadow */}
        <circle cx={strokeWidth * 1.5} cy={strokeWidth * 2} r={radius + strokeWidth * 2} fill="rgba(0,0,0,0.55)" />

        {/* Outer border — thick */}
        <circle cx={0} cy={0} r={radius + strokeWidth * 2.2} fill="none" stroke={outerStroke} strokeWidth={strokeWidth * 2.8} />

        {/* Body with radial gradient */}
        <circle cx={0} cy={0} r={radius + strokeWidth * 0.8} fill={`url(#${gradId})`} />

        {/* Inner ring */}
        <circle cx={0} cy={0} r={radius - strokeWidth * 1.5} fill="none" stroke={innerStroke} strokeWidth={strokeWidth * 1.2} />

        {/* Chinese character */}
        <text
          x={0}
          y={0}
          fontSize={fontSize}
          fill={textColor}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight="bold"
          fontFamily="Noto Serif SC, serif"
          style={{ userSelect: 'none', textShadow: '0 1px 3px rgba(0,0,0,0.7)' }}
        >
          {char}
        </text>

        {/* Hover glow */}
        {isHovered && !isSelected && (
          <circle cx={0} cy={0} r={radius + strokeWidth * 3} fill="none" stroke={isRed ? 'rgba(255,100,50,0.4)' : 'rgba(180,160,120,0.3)'} strokeWidth={strokeWidth * 3} opacity={0.7} />
        )}

        {/* Selection glow + pulse */}
        {isSelected && (
          <>
            <circle cx={0} cy={0} r={radius + strokeWidth * 4} fill="none" stroke="#f0d080" strokeWidth={strokeWidth * 2.5} opacity={0.8}>
              <animate attributeName="opacity" values="0.8;0.15;0.8" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx={0} cy={0} r={radius + strokeWidth * 2} fill="none" stroke="#d4a843" strokeWidth={strokeWidth * 3} opacity={0.9} />
          </>
        )}
      </g>
    </g>
  );
};
