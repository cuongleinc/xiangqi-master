import React from 'react';
import { useGameStore } from '../../stores/game.store';

const CLASS_STYLES: Record<string, string> = {
  BEST: 'text-green-300',
  EXCELLENT: 'text-green-300/80',
  GOOD: 'text-gold-light',
  INACCURACY: 'text-gold',
  MISTAKE: 'text-red-300',
  BLUNDER: 'text-red-200',
};

/** Client-side classification fallback — mirrors xiangqi-core classifyMove. */
function getClassLocal(evalAfter: number, evalBefore: number): string | null {
  const cpLoss = evalBefore - (-evalAfter);  // negate evalAfter (opponent perspective → player)
  if (cpLoss <= 0) return 'BEST';
  if (cpLoss <= 5) return 'BEST';
  if (cpLoss <= 15) return 'EXCELLENT';
  if (cpLoss <= 50) return 'GOOD';
  if (cpLoss <= 100) return 'INACCURACY';
  if (cpLoss <= 200) return 'MISTAKE';
  return 'BLUNDER';
}

const CLASS_LABEL: Record<string, string> = {
  BEST: 'Best',
  EXCELLENT: 'Excel',
  GOOD: 'Good',
  INACCURACY: 'Inacc',
  MISTAKE: 'Mist',
  BLUNDER: 'Blunder',
};

export const MoveList: React.FC = () => {
  const moves = useGameStore((s) => s.moves);
  const moveCount = useGameStore((s) => s.moveCount);

  return (
    <div className="bg-[#150c00] rounded-lg">
      {/* Header */}
      <h3 className="text-gold font-serif text-xs tracking-[0.08em] uppercase px-3 py-2 border-b border-gold/30">
        MOVES
      </h3>

      <div className="p-2">
        {moves.length === 0 ? (
          <p className="text-cream-dim/40 text-xs text-center py-4">No moves yet</p>
        ) : (
          <div className="max-h-52 overflow-y-auto space-y-0.5 font-mono text-xs">
            {moves.map((move, i) => {
              const isLatest = move.moveNumber === moveCount;
              const isEven = i % 2 === 0;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-sm transition-colors ${
                    isLatest
                      ? 'bg-gold/15 text-gold-light'
                      : isEven
                        ? 'text-[#a07840]'
                        : 'text-cream-dim/80'
                  }`}
                >
                  <span className="text-cream-dim/40 w-6 text-right text-[10px] flex-shrink-0">{move.moveNumber}.</span>
                  <span className="flex-1">{move.uci}</span>
                  {/* Show classification from backend, or compute locally from eval data */}
                  {(() => {
                    const cls = move.classification
                      || (move.evaluationBefore != null && move.evaluationAfter != null
                        ? getClassLocal(move.evaluationAfter, move.evaluationBefore)
                        : null);
                    return cls ? (
                      <span className={`text-[9px] font-semibold flex-shrink-0 ${CLASS_STYLES[cls] || 'text-cream-dim'}`}>
                        {CLASS_LABEL[cls] || cls}
                      </span>
                    ) : null;
                  })()}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
