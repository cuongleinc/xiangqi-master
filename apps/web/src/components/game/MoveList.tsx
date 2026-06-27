import React from 'react';
import { useGameStore } from '../../stores/game.store';

export const MoveList: React.FC = () => {
  const moves = useGameStore((s) => s.moves);

  return (
    <div className="bg-[#16213e] rounded-lg p-4 text-sm">
      <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs tracking-wide">Moves</h3>

      {moves.length === 0 ? (
        <p className="text-gray-600 text-xs">No moves yet</p>
      ) : (
        <div className="max-h-48 overflow-y-auto space-y-1 font-mono text-xs">
          {moves.map((move, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 py-0.5 ${i % 2 === 0 ? 'text-white' : 'text-gray-400'}`}
            >
              <span className="text-gray-600 w-6 text-right">{move.moveNumber}.</span>
              <span className="flex-1">{move.uci}</span>
              {move.classification && (
                <span className={`text-[10px] px-1 rounded ${getClassificationColor(move.classification)}`}>
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

function getClassificationColor(c: string): string {
  switch (c) {
    case 'BEST': return 'bg-green-800 text-green-300';
    case 'EXCELLENT': return 'bg-green-700 text-green-300';
    case 'GOOD': return 'bg-blue-800 text-blue-300';
    case 'INACCURACY': return 'bg-yellow-800 text-yellow-300';
    case 'MISTAKE': return 'bg-orange-800 text-orange-300';
    case 'BLUNDER': return 'bg-red-800 text-red-300';
    default: return 'bg-gray-700 text-gray-400';
  }
}
