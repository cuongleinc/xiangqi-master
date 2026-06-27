// Convert between WXF standard FEN and Pikafish-compatible FEN
// WXF: H/h=Horse, E/e=Elephant
// Pikafish: N/n=Horse, B/b=Elephant

export function fenToPikafish(fen: string): string {
  // Only convert the board part (before first space)
  const parts = fen.split(/\s+/);
  if (parts.length === 0 || !parts[0]) return fen;

  const boardPart = parts[0]!;
  let converted = '';
  for (const ch of boardPart) {
    switch (ch) {
      case 'H': converted += 'N'; break;
      case 'h': converted += 'n'; break;
      case 'E': converted += 'B'; break;
      case 'e': converted += 'b'; break;
      default: converted += ch;
    }
  }

  return [converted, ...parts.slice(1)].join(' ');
}

export function fenFromPikafish(fen: string): string {
  const parts = fen.split(/\s+/);
  if (parts.length === 0 || !parts[0]) return fen;

  const boardPart = parts[0]!;
  let converted = '';
  for (const ch of boardPart) {
    switch (ch) {
      case 'N': converted += 'H'; break;
      case 'n': converted += 'h'; break;
      case 'B': converted += 'E'; break;
      case 'b': converted += 'e'; break;
      default: converted += ch;
    }
  }

  return [converted, ...parts.slice(1)].join(' ');
}
