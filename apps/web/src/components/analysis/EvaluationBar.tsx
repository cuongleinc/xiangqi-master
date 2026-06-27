import React, { useMemo } from 'react';
import { parseFen } from '@repo/xiangqi-core';

interface EvaluationBarProps {
  fen: string | null;
  isThinking?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ fen, isThinking }) => {
  // For now, evaluation comes from fen context
  // In full implementation, this would use the analysis store
  const score = 0; // placeholder — actual eval from API

  // Score is in centipawns. Positive = Red advantage.
  // Convert to display: score / 100
  const displayScore = score / 100;
  const clampedScore = Math.max(-10, Math.min(10, displayScore));

  // Map score to percentage height for the bar
  // 0 = middle, positive = Red fills from bottom, negative = Black fills from top
  const redPercent = Math.max(0, Math.min(100, 50 + clampedScore * 5));
  const blackPercent = 100 - redPercent;

  const formatScore = (s: number) => {
    if (s === 0) return '0.00';
    return s > 0 ? `+${s.toFixed(2)}` : s.toFixed(2);
  };

  return (
    <div className="flex flex-col items-center w-8 flex-shrink-0">
      {/* Score display */}
      <span className="text-xs text-gray-400 font-mono mb-1">
        {isThinking ? '...' : formatScore(displayScore)}
      </span>

      {/* Bar */}
      <div className="flex-1 w-6 bg-[#333] rounded-full overflow-hidden relative min-h-[200px]">
        {/* Black portion (top) */}
        <div
          className="absolute top-0 left-0 right-0 bg-gray-800 transition-all duration-500 ease-in-out"
          style={{ height: `${blackPercent}%` }}
        />
        {/* Red portion (bottom) */}
        <div
          className="absolute bottom-0 left-0 right-0 bg-red-700 transition-all duration-500 ease-in-out"
          style={{ height: `${redPercent}%` }}
        />
        {/* Center line */}
        <div className="absolute top-1/2 left-0 right-0 border-t border-white/50" />
      </div>
    </div>
  );
};
