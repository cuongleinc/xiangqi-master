import React from 'react';

interface AnalysisPanelProps {
  fen: string | null;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ fen }) => {
  return (
    <div className="bg-[#150c00] rounded-lg">
      {/* Header */}
      <h3 className="text-gold font-serif text-xs tracking-[0.08em] uppercase px-3 py-2 border-b border-gold/30">
        PHÂN TÍCH
      </h3>

      <div className="p-3 space-y-3 text-sm">
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Evaluation</span>
          <div className="text-gold-light font-mono text-lg">—</div>
        </div>
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Best Move</span>
          <div className="text-cream font-mono">—</div>
        </div>
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Depth</span>
          <div className="text-cream font-mono">—</div>
        </div>
        <div>
          <span className="text-cream-dim/60 text-[10px] uppercase tracking-wider">Classification</span>
          <div className="text-cream font-mono">—</div>
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
