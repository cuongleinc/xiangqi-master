import React from 'react';

interface LastMoveHighlightProps {
  fromRow: number;
  fromCol: number;
  toRow: number;
  toCol: number;
  cellSize: number;
  padding: number;
}

/**
 * Renders semi-transparent highlight squares on the source and destination
 * of the most recent move, so the player can see what just moved.
 */
export const LastMoveHighlight: React.FC<LastMoveHighlightProps> = ({
  fromRow,
  fromCol,
  toRow,
  toCol,
  cellSize,
  padding,
}) => {
  const half = cellSize * 0.45;

  return (
    <g>
      {/* Source square */}
      <rect
        x={padding + fromCol * cellSize - half}
        y={padding + fromRow * cellSize - half}
        width={cellSize * 0.9}
        height={cellSize * 0.9}
        rx={cellSize * 0.06}
        fill="rgba(212, 168, 67, 0.22)"
        stroke="rgba(212, 168, 67, 0.35)"
        strokeWidth={cellSize * 0.02}
      />
      {/* Destination square — slightly brighter to draw attention to where the piece landed */}
      <rect
        x={padding + toCol * cellSize - half}
        y={padding + toRow * cellSize - half}
        width={cellSize * 0.9}
        height={cellSize * 0.9}
        rx={cellSize * 0.06}
        fill="rgba(212, 168, 67, 0.30)"
        stroke="rgba(212, 168, 67, 0.45)"
        strokeWidth={cellSize * 0.02}
      />
    </g>
  );
};
