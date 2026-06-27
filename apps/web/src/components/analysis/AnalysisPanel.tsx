import React from 'react';

interface AnalysisPanelProps {
  fen: string | null;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ fen }) => {
  return (
    <div className="bg-lacquer border border-gold/20 rounded-lg p-4 text-sm">
      <h3 className="text-cream-dim font-semibold mb-3 uppercase text-xs tracking-wide font-serif">Analysis</h3>

      <div className="space-y-3">
        <div>
          <span className="text-gold-dim text-xs">Evaluation</span>
          <div className="text-gold-light font-mono text-lg">—</div>
        </div>
        <div>
          <span className="text-gold-dim text-xs">Best Move</span>
          <div className="text-cream font-mono">—</div>
        </div>
        <div>
          <span className="text-gold-dim text-xs">Depth</span>
          <div className="text-cream font-mono">—</div>
        </div>
        <div>
          <span className="text-gold-dim text-xs">Classification</span>
          <div className="text-cream font-mono">—</div>
        </div>
        {fen && (
          <div className="pt-2 border-t border-gold/20">
            <span className="text-gold-dim text-xs">FEN</span>
            <div className="text-cream-dim font-mono text-[10px] break-all mt-1 opacity-50">{fen}</div>
          </div>
        )}
      </div>
    </div>
  );
};
