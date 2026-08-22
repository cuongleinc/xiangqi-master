import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAnalysisStore } from '../../stores/analysis.store';

interface EvaluationBarProps {
  fen: string | null;
  isThinking?: boolean;
  horizontal?: boolean;
}

export const EvaluationBar: React.FC<EvaluationBarProps> = ({ fen: _fen, isThinking, horizontal = false }) => {
  const { t } = useTranslation();
  const evaluation = useAnalysisStore((s) => s.evaluation);
  const isEvaluating = useAnalysisStore((s) => s.isEvaluating);

  // Score from engine is in centipawns. Convert to pawns for display.
  const scoreCp = evaluation ?? 0;
  const displayScore = scoreCp / 100;
  const clampedScore = Math.max(-10, Math.min(10, displayScore));
  const redPercent = Math.max(0, Math.min(100, 50 + clampedScore * 5));
  const blackPercent = 100 - redPercent;

  const formatScore = (s: number) => {
    if (s === 0) return '0.00';
    return s > 0 ? `+${s.toFixed(2)}` : s.toFixed(2);
  };

  const showLoading = isThinking || isEvaluating;

  if (horizontal) {
    return (
      <div className="w-full flex items-center gap-2">
        <span className="text-[10px] text-gold-dim font-mono w-14 text-right flex-shrink-0">
          {showLoading ? t('analysis.evaluating') : formatScore(displayScore)}
        </span>
        <div className="flex-1 h-2.5 bg-ebony rounded-full overflow-hidden relative border border-gold/20">
          <div className="absolute top-0 bottom-0 left-0 bg-red-chinese/80 transition-all duration-700 ease-in-out" style={{ width: `${blackPercent}%` }} />
          <div className="absolute top-0 bottom-0 right-0 bg-jade/80 transition-all duration-700 ease-in-out" style={{ width: `${redPercent}%` }} />
          <div className="absolute top-0 bottom-0 left-1/2 border-l border-gold/40" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-8 flex-shrink-0">
      <span className="text-[10px] text-gold-dim font-mono mb-1">
        {showLoading ? t('analysis.evaluating') : formatScore(displayScore)}
      </span>
      <div className="flex-1 w-6 bg-ebony rounded-full overflow-hidden relative min-h-[200px] border border-gold/20">
        <div className="absolute top-0 left-0 right-0 bg-red-chinese/80 transition-all duration-700 ease-in-out" style={{ height: `${blackPercent}%` }} />
        <div className="absolute bottom-0 left-0 right-0 bg-jade/80 transition-all duration-700 ease-in-out" style={{ height: `${redPercent}%` }} />
        <div className="absolute top-1/2 left-0 right-0 border-t border-gold/40" />
      </div>
    </div>
  );
};
