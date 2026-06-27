import React, { useMemo, useRef, useEffect, useState } from 'react';
import { parseFen, indexFromRowCol, getPiece } from '@repo/xiangqi-core';
import { Color } from '@repo/shared';
import { BoardGrid } from './BoardGrid';
import { Piece } from './Piece';
import { LegalMoves } from './LegalMoves';
import { CheckHighlight } from './CheckHighlight';
import { useUiStore } from '../../stores/ui.store';
import { useGameStore } from '../../stores/game.store';
import { useSettingsStore } from '../../stores/settings.store';

interface BoardProps {
  fen: string | null;
  turn: Color;
}

export const Board: React.FC<BoardProps> = ({ fen, turn }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(400);

  const selectedSquare = useUiStore((s) => s.selectedSquare);
  const legalMoves = useUiStore((s) => s.legalMoves);
  const selectSquare = useUiStore((s) => s.selectSquare);
  const showCoordinates = useSettingsStore((s) => s.showCoordinates);
  const makeMove = useGameStore((s) => s.makeMove);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cellSize = Math.min(
    Math.max((containerWidth - 40) / 8, 28),
    68,
  );
  const padding = cellSize * 0.6;
  const svgWidth = padding * 2 + 8 * cellSize;
  const svgHeight = padding * 2 + 9 * cellSize;

  const board = useMemo(() => {
    if (!fen) return null;
    try {
      return parseFen(fen).board;
    } catch {
      return null;
    }
  }, [fen]);

  // Stable piece identity: each piece gets a unique ID tied to its position,
  // NOT its type occurrence count. This prevents pieces of the same type
  // from swapping identities when one moves.
  const pieces = useMemo(() => {
    if (!board) return [];
    const result: Array<{ pieceCode: number; row: number; col: number; id: string }> = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const idx = indexFromRowCol(r, c);
        const piece = getPiece(board, idx);
        if (piece !== 0) {
          // Key by position — each square has at most one piece
          // When a piece moves from (r1,c1) to (r2,c2):
          //   old key (r1-c1) disappears, new key (r2-c2) appears
          // This avoids cross-contamination between same-type pieces
          result.push({ pieceCode: piece, row: r, col: c, id: `p${r}-${c}` });
        }
      }
    }
    return result;
  }, [board]);

  /*
   * ─── Sound Design ───
   * piece-place:  short wooden "click" (~40ms) — wood striking wood, dry and resonant
   *               like a Go stone on a kaya board. NOT plastic or metallic.
   * piece-lift:   subtle friction "slide" (~30ms) — finger lifting off lacquer
   * check:        deeper "thock" (~80ms) — solid knock, alert but not jarring
   * capture:      sharper "clack" (~60ms) — two wood pieces colliding, brief ring
   * game-over:    ceremonial double-tap (~200ms apart) — like closing a wooden box
   * ──────────────────
   */
  const handleClick = (row: number, col: number) => {
    if (!fen) return;
    selectSquare(row, col, fen, turn);
    const pending = (window as unknown as Record<string, unknown>).__pendingMove as string | undefined;
    if (pending) {
      delete (window as unknown as Record<string, unknown>).__pendingMove;
      // TODO: playSound('piece-place')
      makeMove(pending);
    }
  };

  return (
    <div ref={containerRef} className="w-full max-w-[540px] mx-auto">
      <div
        style={{
          borderRadius: 8,
          border: '3px solid #8B4513',
          outline: '1px solid #d4a843',
          outlineOffset: 1,
          boxShadow: 'inset 0 0 30px rgba(0,0,0,0.4), 0 4px 20px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height="100%"
          style={{ display: 'block', maxHeight: `${svgHeight}px` }}
        >
          {/* Board background — bamboo/classic pine */}
          <defs>
            {/* Dong Son bronze drum ornament pattern */}
            <pattern id="bronzeDrum" x={0} y={0} width={cellSize * 2.5} height={cellSize * 2.5} patternUnits="userSpaceOnUse">
              {/* Concentric circle — sun motif */}
              <circle cx={cellSize * 1.25} cy={cellSize * 1.25} r={cellSize * 0.8} fill="none" stroke="#5c3d1a" strokeWidth={0.4} opacity={0.5} />
              <circle cx={cellSize * 1.25} cy={cellSize * 1.25} r={cellSize * 0.55} fill="none" stroke="#5c3d1a" strokeWidth={0.3} opacity={0.4} />
              <circle cx={cellSize * 1.25} cy={cellSize * 1.25} r={cellSize * 0.15} fill="#5c3d1a" opacity={0.3} />
              {/* Sun rays — 8 directions */}
              <line x1={cellSize * 1.25 + 0.22 * cellSize} y1={cellSize * 1.25} x2={cellSize * 1.25 + 0.5 * cellSize} y2={cellSize * 1.25} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              <line x1={cellSize * 1.25 - 0.22 * cellSize} y1={cellSize * 1.25} x2={cellSize * 1.25 - 0.5 * cellSize} y2={cellSize * 1.25} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              <line x1={cellSize * 1.25} y1={cellSize * 1.25 + 0.22 * cellSize} x2={cellSize * 1.25} y2={cellSize * 1.25 + 0.5 * cellSize} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              <line x1={cellSize * 1.25} y1={cellSize * 1.25 - 0.22 * cellSize} x2={cellSize * 1.25} y2={cellSize * 1.25 - 0.5 * cellSize} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              <line x1={cellSize * 1.25 + 0.15 * cellSize} y1={cellSize * 1.25 + 0.15 * cellSize} x2={cellSize * 1.25 + 0.35 * cellSize} y2={cellSize * 1.25 + 0.35 * cellSize} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              <line x1={cellSize * 1.25 - 0.15 * cellSize} y1={cellSize * 1.25 - 0.15 * cellSize} x2={cellSize * 1.25 - 0.35 * cellSize} y2={cellSize * 1.25 - 0.35 * cellSize} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              <line x1={cellSize * 1.25 + 0.15 * cellSize} y1={cellSize * 1.25 - 0.15 * cellSize} x2={cellSize * 1.25 + 0.35 * cellSize} y2={cellSize * 1.25 - 0.35 * cellSize} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              <line x1={cellSize * 1.25 - 0.15 * cellSize} y1={cellSize * 1.25 + 0.15 * cellSize} x2={cellSize * 1.25 - 0.35 * cellSize} y2={cellSize * 1.25 + 0.35 * cellSize} stroke="#5c3d1a" strokeWidth={0.35} opacity={0.4} />
              {/* Spiral / key fret decorations at corners */}
              <path d={`M${cellSize * 0.2},${cellSize * 0.2} h${cellSize * 0.3} v${cellSize * 0.1} h${-cellSize * 0.3} v${-cellSize * 0.1}`} fill="none" stroke="#5c3d1a" strokeWidth={0.35} opacity={0.3} />
              <path d={`M${cellSize * 0.2},${cellSize * 0.2} v${cellSize * 0.3} h${-cellSize * 0.1} v${-cellSize * 0.3} h${cellSize * 0.1}`} fill="none" stroke="#5c3d1a" strokeWidth={0.35} opacity={0.3} />
              <path d={`M${cellSize * 2.3},${cellSize * 0.2} h${-cellSize * 0.3} v${cellSize * 0.1} h${cellSize * 0.3} v${-cellSize * 0.1}`} fill="none" stroke="#5c3d1a" strokeWidth={0.35} opacity={0.3} />
              <path d={`M${cellSize * 2.3},${cellSize * 0.2} v${cellSize * 0.3} h${cellSize * 0.1} v${-cellSize * 0.3} h${-cellSize * 0.1}`} fill="none" stroke="#5c3d1a" strokeWidth={0.35} opacity={0.3} />
              <path d={`M${cellSize * 0.2},${cellSize * 2.3} h${cellSize * 0.3} v${-cellSize * 0.1} h${-cellSize * 0.3} v${cellSize * 0.1}`} fill="none" stroke="#5c3d1a" strokeWidth={0.35} opacity={0.3} />
              <path d={`M${cellSize * 2.3},${cellSize * 2.3} h${-cellSize * 0.3} v${-cellSize * 0.1} h${cellSize * 0.3} v${cellSize * 0.1}`} fill="none" stroke="#5c3d1a" strokeWidth={0.35} opacity={0.3} />
              {/* Dot border — like bronze drum rim dots */}
              <circle cx={cellSize * 0.3} cy={cellSize * 0.3} r={0.5} fill="#5c3d1a" opacity={0.3} />
              <circle cx={cellSize * 1.25} cy={cellSize * 0.3} r={0.5} fill="#5c3d1a" opacity={0.3} />
              <circle cx={cellSize * 2.2} cy={cellSize * 0.3} r={0.5} fill="#5c3d1a" opacity={0.3} />
            </pattern>

            <filter id="woodGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
              <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
              <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="blended" />
            </filter>
          </defs>

          {/* Board base color */}
          <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="#c8a96e" />

          {/* Dong Son bronze drum watermark — very subtle depth */}
          <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="url(#bronzeDrum)" opacity={0.04} />

          {/* Board inner border at the board edge */}
          <rect
            x={padding * 0.4}
            y={padding * 0.4}
            width={svgWidth - padding * 0.8}
            height={svgHeight - padding * 0.8}
            fill="none"
            stroke="#8B4513"
            strokeWidth={cellSize * 0.08}
          />

          {/* Grid lines drawn ON the board background */}
          <BoardGrid cellSize={cellSize} padding={padding} showCoordinates={showCoordinates} />

          {/* Pieces rendered on top of grid */}
          {pieces.map((p) => (
          <Piece
            key={p.id}
            pieceId={p.id}
            pieceCode={p.pieceCode}
            row={p.row}
            col={p.col}
            cellSize={cellSize}
            padding={padding}
            isSelected={
              selectedSquare?.[0] === p.row && selectedSquare?.[1] === p.col
            }
          />
        ))}

        <LegalMoves legalMoves={legalMoves} board={board || new Uint8Array(90)} cellSize={cellSize} padding={padding} />
        <CheckHighlight fen={fen} cellSize={cellSize} padding={padding} />

        {Array.from({ length: 10 }, (_, r) =>
          Array.from({ length: 9 }, (_, c) => (
            <rect
              key={`click-${r}-${c}`}
              x={padding + c * cellSize - cellSize * 0.45}
              y={padding + r * cellSize - cellSize * 0.45}
              width={cellSize * 0.9}
              height={cellSize * 0.9}
              fill="transparent"
              style={{ cursor: 'pointer' }}
              onClick={() => handleClick(r, c)}
            />
          )),
        )}
      </svg>
      </div>
    </div>
  );
};
