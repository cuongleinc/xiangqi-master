import { create } from 'zustand';
import {
  generateLegalMoves, parseFen, indexFromRowCol,
  getPiece, getColor, rowColFromIndex
} from '@repo/xiangqi-core';
import type { Move } from '@repo/xiangqi-core';
import { Color } from '@repo/shared';

interface UiStoreState {
  selectedSquare: [number, number] | null;
  legalMoves: [number, number][];
  isDragging: boolean;
  draggedPiece: { piece: number; from: [number, number] } | null;
  hintMove: { from: [number, number]; to: [number, number] } | null;
  pendingMoveUci: string | null;
  activeDialog: string | null;
  confirmMessage: string | null;
  confirmCallback: (() => void) | null;
  isBoardLoading: boolean;
  apiErrorMessage: string | null;

  selectSquare: (row: number, col: number, fen: string | null, turn: Color) => void;
  clearSelection: () => void;
  showHint: (from: [number, number], to: [number, number]) => void;
  clearHint: () => void;
  clearAllHighlights: () => void;
  consumePendingMove: () => string | null;
  openDialog: (dialog: string) => void;
  closeDialog: () => void;
  showConfirm: (message: string, onConfirm: () => void) => void;
  clearConfirm: () => void;
  setLoading: (loading: boolean) => void;
  setError: (msg: string | null) => void;
}

export const useUiStore = create<UiStoreState>((set, get) => ({
  selectedSquare: null,
  legalMoves: [],
  isDragging: false,
  draggedPiece: null,
  hintMove: null,
  pendingMoveUci: null,
  activeDialog: null,
  confirmMessage: null,
  confirmCallback: null,
  isBoardLoading: false,
  apiErrorMessage: null,

  selectSquare: (row, col, fen, turn) => {
    if (!fen) return;

    const { selectedSquare } = get();
    const parsed = parseFen(fen);
    const board = parsed.board;
    const idx = indexFromRowCol(row, col);
    const piece = getPiece(board, idx);

    if (selectedSquare) {
      const [selRow, selCol] = selectedSquare;
      // If clicking on own piece, switch selection
      if (piece !== 0 && piece !== undefined) {
        const pieceColor = getColor(piece);
        if (pieceColor === turn) {
          set({ selectedSquare: [row, col] });
          const moves = generateLegalMoves(board, turn);
          const dests: [number, number][] = moves
            .filter((m: Move) => m.fromRow === row && m.fromCol === col)
            .map((m: Move) => [m.toRow, m.toCol] as [number, number]);
          set({ legalMoves: dests });
          return;
        }
      }

      // Check if clicking on a legal destination
      const isLegal = get().legalMoves.some(([r, c]) => r === row && c === col);
      if (isLegal) {
        // Make the move — store UCI for Board.handleClick to consume
        const ucci = `${String.fromCharCode(97 + selCol)}${selRow}${String.fromCharCode(97 + col)}${row}`;
        set({ selectedSquare: null, legalMoves: [], pendingMoveUci: ucci });
        return;
      }

      set({ selectedSquare: null, legalMoves: [] });
      return;
    }

    // No square selected — select if own piece
    if (piece !== 0 && piece !== undefined) {
      const pieceColor = getColor(piece);
      if (pieceColor === turn) {
        set({ selectedSquare: [row, col] });
        const moves = generateLegalMoves(board, turn);
        const dests: [number, number][] = moves
          .filter((m: Move) => m.fromRow === row && m.fromCol === col)
          .map((m: Move) => [m.toRow, m.toCol] as [number, number]);
        set({ legalMoves: dests });
      }
    }
  },

  clearSelection: () => set({ selectedSquare: null, legalMoves: [] }),

  showHint: (from, to) => set({ hintMove: { from, to }, selectedSquare: null, legalMoves: [] }),
  clearHint: () => set({ hintMove: null }),

  /** Clear both selection and hint — for Best Move / auto-play */
  clearAllHighlights: () => set({ selectedSquare: null, legalMoves: [], hintMove: null }),

  consumePendingMove: () => {
    const uci = get().pendingMoveUci;
    if (uci) set({ pendingMoveUci: null });
    return uci;
  },

  openDialog: (dialog) => set({ activeDialog: dialog }),
  closeDialog: () => set({ activeDialog: null }),

  showConfirm: (message, onConfirm) => set({ confirmMessage: message, confirmCallback: onConfirm }),
  clearConfirm: () => set({ confirmMessage: null, confirmCallback: null }),

  setLoading: (loading) => set({ isBoardLoading: loading }),
  setError: (msg) => set({ apiErrorMessage: msg }),
}));
