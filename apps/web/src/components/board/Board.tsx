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

  const pieces = useMemo(() => {
    if (!board) return [];
    const result: Array<{ pieceCode: number; row: number; col: number }> = [];
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 9; c++) {
        const idx = indexFromRowCol(r, c);
        const piece = getPiece(board, idx);
        if (piece !== 0) {
          result.push({ pieceCode: piece, row: r, col: c });
        }
      }
    }
    return result;
  }, [board]);

  const handleClick = (row: number, col: number) => {
    if (!fen) return;
    selectSquare(row, col, fen, turn);
    const pending = (window as unknown as Record<string, unknown>).__pendingMove as string | undefined;
    if (pending) {
      delete (window as unknown as Record<string, unknown>).__pendingMove;
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
            <filter id="woodGrain">
              <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise" />
              <feColorMatrix type="saturate" values="0" in="noise" result="gray" />
              <feBlend in="SourceGraphic" in2="gray" mode="multiply" result="blended" />
            </filter>
          </defs>
          <rect x={0} y={0} width={svgWidth} height={svgHeight} fill="#c8a96e" />

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

          {pieces.map((p) => (
          <Piece
            key={`${p.row}-${p.col}`}
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
