import { uciToReadable } from './notation';
import type { MoveRecordData } from '../stores/game.store';

interface PgnGameData {
  gameId: string;
  fen: string;
  status: string;
  moves: MoveRecordData[];
}

function resultString(status: string): string {
  switch (status) {
    case 'red_wins': return '1-0';
    case 'black_wins': return '0-1';
    case 'draw': return '1/2-1/2';
    default: return '*';
  }
}

function todayDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

/**
 * Build a PGN-style export string for a Xiangqi game.
 * Uses the same WXF notation as the MOVES panel (uciToReadable).
 */
export function buildPgn(data: PgnGameData): string {
  const { gameId, fen, status, moves } = data;
  const lines: string[] = [];

  // Headers
  lines.push('[Event "Casual Game"]');
  lines.push('[Site "Xiangqi Master"]');
  lines.push(`[Date "${todayDate()}"]`);
  lines.push('[Red "Player 1"]');
  lines.push('[Black "Player 2"]');
  lines.push(`[Result "${resultString(status)}"]`);
  lines.push(`[FEN "${fen}"]`);
  lines.push('');

  // Movetext — paired rows: "1. C2=5 H8-2  2. ..."
  const movetextLines: string[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const moveNum = Math.floor(i / 2) + 1;
    const red = moves[i];
    const black = moves[i + 1];

    const redNotation = red ? uciToReadable(red.uci, red.fenBefore) : '';
    const blackNotation = black ? uciToReadable(black.uci, black.fenBefore) : '';

    let line = `${moveNum}. ${redNotation}`;
    if (blackNotation) {
      line += ` ${blackNotation}`;
    }
    movetextLines.push(line);
  }

  // Add result at end of movetext
  const result = resultString(status);
  if (movetextLines.length > 0) {
    movetextLines[movetextLines.length - 1] += ` ${result}`;
  } else {
    movetextLines.push(result);
  }

  lines.push(movetextLines.join('  '));
  lines.push('');

  return lines.join('\n');
}

/**
 * Trigger a .pgn file download in the browser.
 */
export function downloadPgn(data: PgnGameData): void {
  const pgn = buildPgn(data);
  const blob = new Blob([pgn], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xiangqi-master-${data.gameId.slice(0, 8)}-${todayDate()}.pgn`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
