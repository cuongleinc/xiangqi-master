// Auto-generated player name pool — Xiangqi-flavored Vietnamese titles
// Easy to extend: just add more entries to the array
export const PLAYER_TITLES = [
  'Kỵ sĩ',
  'Tướng quân',
  'Mưu sĩ',
  'Chiến binh',
  'Đô đốc',
  'Công tước',
  'Nguyên soái',
  'Tráng sĩ',
  'Quân sư',
  'Hổ tướng',
] as const;

/** Generate a random display name like "Kỵ sĩ #4827" */
export function generatePlayerName(): string {
  const title = PLAYER_TITLES[Math.floor(Math.random() * PLAYER_TITLES.length)];
  const num = Math.floor(1000 + Math.random() * 9000);
  return `${title} #${num}`;
}

// ── Timing constants (milliseconds) ──
/** How long a solo player waits in queue before AI fallback kicks in */
export const QUEUE_AI_FALLBACK_MS = 20_000;

/** Grace period for a disconnected player to reconnect before forfeit */
export const DISCONNECT_GRACE_MS = 30_000;

/** Default difficulty when matchmaking falls back to AI */
export const AI_FALLBACK_DIFFICULTY = 'medium';
