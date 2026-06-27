import React from 'react';
import { useGameStore } from '../../stores/game.store';

export const MoveList: React.FC = () => {
  const moves = useGameStore((s) => s.moves);
  const moveCount = useGameStore((s) => s.moveCount);

  return (
    <div className="bg-[#150c00] rounded-lg">
      {/* Header */}
      <h3 className="text-gold font-serif text-xs tracking-[0.08em] uppercase px-3 py-2 border-b border-gold/30">
        NƯỚC ĐI
      </h3>

      <div className="p-2">
        {moves.length === 0 ? (
          <p className="text-cream-dim/40 text-xs text-center py-4">Chưa có nước đi</p>
        ) : (
          <div className="max-h-52 overflow-y-auto space-y-0.5 font-mono text-xs">
            {moves.map((move, i) => {
              const isLatest = move.moveNumber === moveCount;
              const isEven = i % 2 === 0;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-2 py-1 rounded-sm transition-colors ${
                    isLatest
                      ? 'bg-gold/15 text-gold-light'
                      : isEven
                        ? 'text-[#a07840]'
                        : 'text-cream-dim/80'
                  }`}
                >
                  <span className="text-cream-dim/40 w-6 text-right text-[10px]">{move.moveNumber}.</span>
                  <span className="flex-1">{move.uci}</span>
                  {move.classification && (
                    <span className={`text-[9px] px-1 rounded ${getClass(move.classification)}`}>
                      {move.classification.slice(0, 2)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

function getClass(c: string): string {
  switch (c) {
    case 'BEST': return 'bg-jade/40 text-green-300';
    case 'EXCELLENT': return 'bg-jade/25 text-green-300';
    case 'GOOD': return 'bg-gold/25 text-gold-light';
    case 'INACCURACY': return 'bg-gold-dim/25 text-gold';
    case 'MISTAKE': return 'bg-red-chinese/25 text-red-300';
    case 'BLUNDER': return 'bg-red-chinese/50 text-red-200';
    default: return 'bg-lacquer/50 text-cream-dim';
  }
}
