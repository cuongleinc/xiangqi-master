import React, { useState } from 'react';
import { getPieceInfo } from '@repo/xiangqi-core';
import { Color, PIECE_CHARS } from '@repo/shared';
import { colToX, rowToY } from './coords';

interface PieceProps {
  pieceCode: number;
  pieceId: string;
  row: number;
  col: number;
  cellSize: number;
  padding: number;
  isSelected: boolean;
  isDragging?: boolean;
}

const MOVE_EASING = 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)';
const HOVER_EASING = 'transform 0.15s ease-out';

export const Piece: React.FC<PieceProps> = ({ pieceCode, pieceId, row, col, cellSize, padding, isSelected, isDragging }) => {
  const [isHovered, setIsHovered] = useState(false);
  const info = getPieceInfo(pieceCode);
  if (!info) return null;

  const isRed = info.color === Color.RED;
  const char = PIECE_CHARS[info.color]?.[info.type] || '?';

  const radius = cellSize * 0.41;
  const cx = colToX(col, cellSize, padding);
  const cy = rowToY(row, cellSize, padding);
  const pieceDiameter = cellSize * 0.82;
  const fontSize = pieceDiameter * 0.45 * 1.3; // +30%
  const strokeWidth = cellSize * 0.04;
  const gradId = `grad-${pieceId}`;
  const shadowId = `shadow-${pieceId}`;
  const glowId = `glow-${pieceId}`;

  // Red piece: warm carved rosewood
  const redGradCenter = '#d4845a';
  const redGradMid = '#8B3A1A';
  const redGradEdge = '#5c1e08';
  const redBorder = '#6b1a0a';
  const redOuterRing = 'rgba(210,140,80,0.3)';
  const redHighlight = 'rgba(255,180,120,0.35)';
  const redTextColor = '#ffe0d0';
  const redTextShadow = '0 1px 2px rgba(0,0,0,0.8)';

  // Black piece: dark carved hardwood
  const blackGradCenter = '#6b5a3e';
  const blackGradMid = '#2d1f0e';
  const blackGradEdge = '#1a0f05';
  const blackBorder = '#0d0805';
  const blackOuterRing = 'rgba(180,140,80,0.15)';
  const blackHighlight = 'rgba(180,140,80,0.2)';
  const blackTextColor = '#d4c5a0';
  const blackTextShadow = '0 1px 2px rgba(0,0,0,0.9), 0 -1px 1px rgba(180,140,60,0.3)';

  const gradCenter = isRed ? redGradCenter : blackGradCenter;
  const gradMid = isRed ? redGradMid : blackGradMid;
  const gradEdge = isRed ? redGradEdge : blackGradEdge;
  const borderColor = isRed ? redBorder : blackBorder;
  const outerRingColor = isRed ? redOuterRing : blackOuterRing;
  const highlightColor = isRed ? redHighlight : blackHighlight;
  const textColor = isRed ? redTextColor : blackTextColor;
  const textShadow = isRed ? redTextShadow : blackTextShadow;

  const hoverScale = isHovered && !isDragging ? 1.08 : 1;

  return (
    <g
      style={{ transition: MOVE_EASING, cursor: 'pointer' }}
      transform={`translate(${cx}, ${cy})`}
      opacity={isDragging ? 0.4 : 1}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <g style={{ transition: HOVER_EASING, transformOrigin: '0px 0px' }} transform={`scale(${hoverScale})`}>
        <defs>
          {/* Carved wood radial gradient — light hits convex surface at top-left */}
          <radialGradient id={gradId} cx="38%" cy="32%" r="68%">
            <stop offset="0%" stopColor={gradCenter} />
            <stop offset="55%" stopColor={gradMid} />
            <stop offset="100%" stopColor={gradEdge} />
          </radialGradient>

          {/* Drop shadow filter */}
          <filter id={shadowId} x="-30%" y="-20%" width="170%" height="170%">
            <feDropShadow dx={2} dy={4} stdDeviation={3} floodColor="rgba(0,0,0,0.7)" />
          </filter>

          {/* Selection glow filter */}
          <filter id={glowId} x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={4} result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Piece shadow group */}
        <g filter={`url(#${shadowId})`}>
          {/* Outer glow ring */}
          <circle cx={0} cy={0} r={radius + strokeWidth * 2.8} fill="none" stroke={outerRingColor} strokeWidth={1.5} />
          {/* Main border */}
          <circle cx={0} cy={0} r={radius + strokeWidth * 2} fill="none" stroke={borderColor} strokeWidth={2.5} />
          {/* Wood body */}
          <circle cx={0} cy={0} r={radius + strokeWidth * 0.7} fill={`url(#${gradId})`} />
          {/* Inner highlight — light catching convex top surface */}
          <circle cx={0} cy={0} r={radius - strokeWidth * 2} fill="none" stroke={highlightColor} strokeWidth={strokeWidth * 1.5} opacity={0.7} />
          {/* Bottom shadow — darker edge at bottom */}
          <circle cx={0} cy={0} r={radius - strokeWidth * 0.5} fill="none" stroke="rgba(0,0,0,0.5)" strokeWidth={strokeWidth * 1.2} opacity={0.4} />
        </g>

        {/* Chinese character */}
        <text
          x={0}
          y={0}
          fontSize={fontSize}
          fill={textColor}
          textAnchor="middle"
          dominantBaseline="central"
          fontWeight={700}
          fontFamily="Ma Shan Zheng, serif"
          style={{ userSelect: 'none', textShadow }}
        >
          {char}
        </text>

        {/* Hover glow */}
        {isHovered && !isSelected && (
          <circle cx={0} cy={0} r={radius + strokeWidth * 3.5} fill="none" stroke={isRed ? 'rgba(255,140,80,0.4)' : 'rgba(180,150,100,0.3)'} strokeWidth={strokeWidth * 3} opacity={0.7} />
        )}

        {/* Selection glow + pulse */}
        {isSelected && (
          <>
            {/* Outer glow ring — pulsing */}
            <circle cx={0} cy={0} r={radius + strokeWidth * 3.5} fill="none" stroke="#f0d080" strokeWidth={strokeWidth * 4} opacity={0.9} filter={`url(#${glowId})`}>
              <animate attributeName="opacity" values="0.9;0.25;0.9" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="r" values={`${radius + strokeWidth * 3.5};${radius + strokeWidth * 5};${radius + strokeWidth * 3.5}`} dur="1.2s" repeatCount="indefinite" />
            </circle>
            {/* Solid inner ring — bright gold, always visible */}
            <circle cx={0} cy={0} r={radius + strokeWidth * 1.8} fill="none" stroke="#ffd700" strokeWidth={strokeWidth * 3.5} opacity={0.95} />
            {/* Inner highlight ring for depth */}
            <circle cx={0} cy={0} r={radius + strokeWidth * 1.2} fill="none" stroke="rgba(255,240,200,0.5)" strokeWidth={strokeWidth * 1.5} opacity={0.7} />
          </>
        )}
      </g>
    </g>
  );
};
