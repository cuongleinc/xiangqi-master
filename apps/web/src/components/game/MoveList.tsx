import React from 'react';
import { useGameStore } from '../../stores/game.store';

export const MoveList: React.FC = () => {
  const moves = useGameStore((s) => s.moves);

  return (
    <div className="bg-lacquer border border-gold/20 rounded-lg p-4 text-sm">
      <h3 className="text-cream-dim font-semibold mb-3 uppercase text-xs tracking-wide font-serif">Moves</h3>

      {moves.length === 0 ? (
        <p className="text-gold-dim/50 text-xs">No moves yet</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-xs">
          {moves.map((move, i) => (
            <div key={i} className={`flex items-center gap-2 py-0.5 ${i % 2 === 0 ? 'text-cream' : 'text-cream-dim'}`}>
              <span className="text-gold-dim w-6 text-right">{move.moveNumber}.</span>
              <span className="flex-1">{move.uci}</span>
              {move.classification && (
                <span className={`text-[10px] px-1 rounded ${getClass(move.classification)}`}>
                  {move.classification}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function getClass(c: string): string {
  switch (c) {
    case 'BEST': return 'bg-jade/50 text-green-300';
    case 'EXCELLENT': return 'bg-jade/30 text-green-300';
    case 'GOOD': return 'bg-gold/30 text-gold-light';
    case 'INACCURACY': return 'bg-gold-dim/30 text-gold';
    case 'MISTAKE': return 'bg-red-chinese/30 text-red-300';
    case 'BLUNDER': return 'bg-red-chinese/60 text-red-200';
    default: return 'bg-lacquer text-cream-dim';
  }
}
