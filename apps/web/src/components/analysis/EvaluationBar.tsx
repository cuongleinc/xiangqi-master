import React from 'react';

interface EvaluationBarProps {
  fen: string | null;
  isThinking?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ fen: _fen, isThinking }) => {
  const score = 0;

  const displayScore = score / 100;
  const clampedScore = Math.max(-10, Math.min(10, displayScore));
  const redPercent = Math.max(0, Math.min(100, 50 + clampedScore * 5));
  const blackPercent = 100 - redPercent;

  const formatScore = (s: number) => {
    if (s === 0) return '0.00';
    return s > 0 ? `+${s.toFixed(2)}` : s.toFixed(2);
  };

  return (
    <div className="flex flex-col items-center w-8 flex-shrink-0">
      <span className="text-[10px] text-gold-dim font-mono mb-1">
        {isThinking ? '...' : formatScore(displayScore)}
      </span>
      <div className="flex-1 w-6 bg-ebony rounded-full overflow-hidden relative min-h-[200px] border border-gold/20">
        <div className="absolute top-0 left-0 right-0 bg-red-chinese/80 transition-all duration-700 ease-in-out" style={{ height: `${blackPercent}%` }} />
        <div className="absolute bottom-0 left-0 right-0 bg-jade/80 transition-all duration-700 ease-in-out" style={{ height: `${redPercent}%` }} />
        <div className="absolute top-1/2 left-0 right-0 border-t border-gold/40" />
      </div>
    </div>
  );
};
