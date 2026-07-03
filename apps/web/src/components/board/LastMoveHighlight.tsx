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
 * Renders circular halo highlights on the source and destination
 * of the most recent move — matching the circular piece geometry.
 *
 * Source (empty): filled circle + border ring — clearly marks where
 *   the piece moved from.
 * Destination (piece on top): larger circle + border ring — sits
 *   behind the piece, visible as a soft halo around it.
 *
 * Both are drawn before pieces in the SVG layer order, so the
 * destination halo naturally sits underneath the piece.
 */
export const LastMoveHighlight: React.FC<LastMoveHighlightProps> = ({
  fromRow,
  fromCol,
  toRow,
  toCol,
  cellSize,
  padding,
}) => {
  const cxFrom = padding + fromCol * cellSize;
  const cyFrom = padding + fromRow * cellSize;
  const cxTo = padding + toCol * cellSize;
  const cyTo = padding + toRow * cellSize;

  // Piece radius is cellSize*0.41. Use slightly larger radii
  // so the highlight extends just beyond the piece edge.
  const rFrom = cellSize * 0.46;        // source — empty square, visible disk
  const rFromBorder = cellSize * 0.47;  // source ring
  const rTo = cellSize * 0.48;          // dest — larger fill behind piece
  const rToBorder = cellSize * 0.49;    // dest ring (halo visible around piece)
  const borderW = cellSize * 0.04;      // ~2.8px at 70px cell

  return (
    <g>
      {/* ── Source square (empty — piece moved away) ── */}
      {/* Filled circle — clearly visible where the piece was */}
      <circle
        cx={cxFrom}
        cy={cyFrom}
        r={rFrom}
        fill="rgba(255, 193, 7, 0.50)"
        stroke="none"
      />
      {/* Border ring */}
      <circle
        cx={cxFrom}
        cy={cyFrom}
        r={rFromBorder}
        fill="none"
        stroke="rgba(255, 179, 0, 0.90)"
        strokeWidth={borderW}
      />

      {/* ── Destination square (piece sits on top — ring shows as halo) ── */}
      {/* Filled circle — center hidden by piece, edge glows around it */}
      <circle
        cx={cxTo}
        cy={cyTo}
        r={rTo}
        fill="rgba(255, 193, 7, 0.60)"
        stroke="none"
      />
      {/* Border ring — visible halo around the piece */}
      <circle
        cx={cxTo}
        cy={cyTo}
        r={rToBorder}
        fill="none"
        stroke="rgba(255, 179, 0, 0.95)"
        strokeWidth={borderW * 1.15}
      />
    </g>
  );
};
