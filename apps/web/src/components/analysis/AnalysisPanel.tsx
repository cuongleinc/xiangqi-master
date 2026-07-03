import React from 'react';
import { useAnalysisStore } from '../../stores/analysis.store';

interface AnalysisPanelProps {
  fen: string | null;
}

function formatScoreCp(cp: number | null): string {
  if (cp === null) return '—';
  const pawns = cp / 100;
  if (pawns === 0) return '0.00';
  return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ fen }) => {
  const evaluation = useAnalysisStore((s) => s.evaluation);
  const bestMove = useAnalysisStore((s) => s.bestMove);
  const depth = useAnalysisStore((s) => s.depth);
  const lastClassification = useAnalysisStore((s) => s.lastClassification);
  const pv = useAnalysisStore((s) => s.pv);
  const isEvaluating = useAnalysisStore((s) => s.isEvaluating);

  return (
    <div className="bg-[#150c00] rounded-lg">
      {/* Header */}
      <h3 className="text-gold font-serif text-xs tracking-[0.08em] uppercase px-3 py-2 border-b border-gold/30">
        ANALYSIS
      </h3>

      <div className="p-3 space-y-3 text-sm">
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Evaluation</span>
          <div className="text-gold-light font-mono text-lg">
            {isEvaluating ? '...' : formatScoreCp(evaluation)}
          </div>
        </div>
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Best Move</span>
          <div className="text-cream font-mono">{bestMove ?? '—'}</div>
        </div>
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Depth</span>
          <div className="text-cream font-mono">{depth !== null ? `${depth}` : '—'}</div>
        </div>
        {pv.length > 0 && (
          <div>
            <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">PV</span>
            <div className="text-cream-dim font-mono text-[10px] break-all mt-0.5">{pv.join(' ')}</div>
          </div>
        )}
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Classification</span>
          <div className="text-cream font-mono">{lastClassification ?? '—'}</div>
        </div>
        {fen && (
          <div className="pt-2 border-t border-[#3d2010]">
            <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">FEN</span>
            <div className="text-cream-dim/50 font-mono text-[10px] break-all mt-1">{fen}</div>
          </div>
        )}
      </div>
    </div>
  );
};
