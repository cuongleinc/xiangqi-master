// Move generator — generates all pseudo-legal moves for a color

import { Color, PieceType } from '@repo/shared';
import { getPiece, getColor, getType, findPieces, indexFromRowCol, rowColFromIndex } from '../board';
import { getKingMoves } from '../pieces/king';
import { getAdvisorMoves } from '../pieces/advisor';
import { getElephantMoves } from '../pieces/elephant';
import { getHorseMoves } from '../pieces/horse';
import { getChariotMoves } from '../pieces/chariot';
import { getCannonMoves } from '../pieces/cannon';
import { getSoldierMoves } from '../pieces/soldier';
import type { Move } from './move-types';

// Generate all pseudo-legal moves (before filtering self-check)
export function generatePseudoLegalMoves(board: Uint8Array, color: Color): Move[] {
  const pieces = findPieces(board, color);
  const moves: Move[] = [];

  for (const pos of pieces) {
    const [row, col] = rowColFromIndex(pos);
    const piece = getPiece(board, pos);
    const type = getType(piece);
    if (type === null) continue;

    const destinations = getPieceDestinations(board, row, col, type);
    for (const [dr, dc] of destinations) {
      const toIdx = indexFromRowCol(dr, dc);
      const captured = getPiece(board, toIdx);
      moves.push({
        fromRow: row,
        fromCol: col,
        toRow: dr,
        toCol: dc,
        piece,
        captured: captured === 0 ? undefined : captured,
      });
    }
  }

  return moves;
}

function getPieceDestinations(
  board: Uint8Array,
  row: number,
  col: number,
  type: PieceType,
): [number, number][] {
  switch (type) {
    case PieceType.KING: return getKingMoves(board, row, col);
    case PieceType.ADVISOR: return getAdvisorMoves(board, row, col);
    case PieceType.ELEPHANT: return getElephantMoves(board, row, col);
    case PieceType.HORSE: return getHorseMoves(board, row, col);
    case PieceType.CHARIOT: return getChariotMoves(board, row, col);
    case PieceType.CANNON: return getCannonMoves(board, row, col);
    case PieceType.SOLDIER: return getSoldierMoves(board, row, col);
  }
}

// Generate only legal moves (filter out self-check and Flying General)
export function generateLegalMoves(board: Uint8Array, color: Color): Move[] {
  const pseudoMoves = generatePseudoLegalMoves(board, color);
  return pseudoMoves.filter((move) => !wouldBeIllegal(board, move, color));
}

// Generate only captures
export function generateCaptures(board: Uint8Array, color: Color): Move[] {
  return generateLegalMoves(board, color).filter((m) => m.captured !== undefined);
}

// Check if a move leaves own king in check or creates Flying General
function wouldBeIllegal(board: Uint8Array, move: Move, color: Color): boolean {
  // Apply the move
  const newBoard = new Uint8Array(board);
  const fromIdx = indexFromRowCol(move.fromRow, move.fromCol);
  const toIdx = indexFromRowCol(move.toRow, move.toCol);
  newBoard[toIdx] = move.piece;
  newBoard[fromIdx] = 0;

  // Check if own king is in check after the move
  if (isKingInCheck(newBoard, color)) return true;

  // Check Flying General after the move
  if (isFlyingGeneralAfterMove(newBoard)) return true;

  return false;
}

// Check if the given color's king is in check
function isKingInCheck(board: Uint8Array, color: Color): boolean {
  const opponentColor = color === Color.RED ? Color.BLACK : Color.RED;
  const kingPos = findKingIndex(board, color);
  if (kingPos === null) return true; // no king = in check (shouldn't happen)

  const opponentMoves = generatePseudoLegalMoves(board, opponentColor);
  for (const move of opponentMoves) {
    if (move.toRow * 9 + move.toCol === kingPos) return true;
  }

  return false;
}

function findKingIndex(board: Uint8Array, color: Color): number | null {
  const kingCode = color === Color.RED ? 1 : 8;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === kingCode) return i;
  }
  return null;
}

// Check Flying General on a board (after a move is applied)
function isFlyingGeneralAfterMove(board: Uint8Array): boolean {
  const redKingIdx = findKingIndex(board, Color.RED);
  const blackKingIdx = findKingIndex(board, Color.BLACK);
  if (redKingIdx === null || blackKingIdx === null) return false;

  const redCol = redKingIdx % 9;
  const blackCol = blackKingIdx % 9;
  if (redCol !== blackCol) return false;

  const redRow = Math.floor(redKingIdx / 9);
  const blackRow = Math.floor(blackKingIdx / 9);
  const minRow = Math.min(redRow, blackRow);
  const maxRow = Math.max(redRow, blackRow);

  for (let r = minRow + 1; r < maxRow; r++) {
    if (board[r * 9 + redCol] !== 0) return false;
  }

  return true; // Flying General violation
}
