import React from 'react';
import { colToX, rowToY } from './coords';

interface HintHighlightProps {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  cellSize: number;
  padding: number;
}

/**
 * Renders an animated hint overlay showing the suggested move:
 * - Pulsing gold highlights on source and destination squares
 * - Animated flowing arrow from source to destination
 */
export const HintHighlight: React.FC<HintHighlightProps> = ({
  fromRow,
  fromCol,
  toRow,
  toCol,
  cellSize,
  padding,
}) => {
  const half = cellSize * 0.45;
  const fromCx = colToX(fromCol, cellSize, padding);
  const fromCy = rowToY(fromRow, cellSize, padding);
  const toCx = colToX(toCol, cellSize, padding);
  const toCy = rowToY(toRow, cellSize, padding);

  // Compute arrowhead triangle points at the destination
  const angle = Math.atan2(toCy - fromCy, toCx - fromCx);
  const arrowLen = cellSize * 0.28;
  // Arrow tip is slightly inset from the destination center (so it doesn't overlap the piece)
  const tipInset = cellSize * 0.48;
  const tipX = toCx - tipInset * Math.cos(angle);
  const tipY = toCy - tipInset * Math.sin(angle);
  const leftX = tipX - arrowLen * Math.cos(angle - 0.55);
  const leftY = tipY - arrowLen * Math.sin(angle - 0.55);
  const rightX = tipX - arrowLen * Math.cos(angle + 0.55);
  const rightY = tipY - arrowLen * Math.sin(angle + 0.55);

  // Arrow shaft: from source edge to destination edge
  const shaftStartInset = cellSize * 0.48;
  const shaftEndInset = cellSize * 0.50;
  const shaftX1 = fromCx + shaftStartInset * Math.cos(angle);
  const shaftY1 = fromCy + shaftStartInset * Math.sin(angle);
  const shaftX2 = toCx - shaftEndInset * Math.cos(angle);
  const shaftY2 = toCy - shaftEndInset * Math.sin(angle);

  return (
    <g>
      {/* Source square glow */}
      <rect
        x={fromCx - half}
        y={fromCy - half}
        width={cellSize * 0.9}
        height={cellSize * 0.9}
        rx={cellSize * 0.06}
        fill="rgba(212, 168, 67, 0.18)"
        stroke="rgba(212, 168, 67, 0.5)"
        strokeWidth={cellSize * 0.025}
      >
        <animate attributeName="opacity" values="0.85;0.4;0.85" dur="0.9s" repeatCount="indefinite" />
      </rect>

      {/* Destination square glow — warmer tone */}
      <rect
        x={toCx - half}
        y={toCy - half}
        width={cellSize * 0.9}
        height={cellSize * 0.9}
        rx={cellSize * 0.06}
        fill="rgba(240, 180, 80, 0.22)"
        stroke="rgba(240, 180, 80, 0.55)"
        strokeWidth={cellSize * 0.028}
      >
        <animate attributeName="opacity" values="1;0.45;1" dur="0.9s" repeatCount="indefinite" />
      </rect>

      {/* Arrow shaft — dashed line that animates in the direction of the move */}
      <line
        x1={shaftX1}
        y1={shaftY1}
        x2={shaftX2}
        y2={shaftY2}
        stroke="rgba(240, 180, 80, 0.65)"
        strokeWidth={cellSize * 0.04}
        strokeDasharray={`${cellSize * 0.18} ${cellSize * 0.12}`}
        strokeLinecap="round"
      >
        {/* Flow animation: dashoffset moves, creating a "marching ants" effect toward destination */}
        <animate
          attributeName="stroke-dashoffset"
          from={0}
          to={-(cellSize * 0.3)}
          dur="0.55s"
          repeatCount="indefinite"
        />
      </line>

      {/* Arrowhead */}
      <polygon
        points={`${tipX},${tipY} ${leftX},${leftY} ${rightX},${rightY}`}
        fill="rgba(240, 180, 80, 0.7)"
      >
        <animate attributeName="opacity" values="1;0.5;1" dur="0.9s" repeatCount="indefinite" />
      </polygon>
    </g>
  );
};
