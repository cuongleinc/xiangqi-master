import React from 'react';

interface AnalysisPanelProps {
  fen: string | null;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ fen }) => {
  return (
    <div className="bg-[#16213e] rounded-lg p-4 text-sm">
      <h3 className="text-gray-400 font-semibold mb-3 uppercase text-xs tracking-wide">Analysis</h3>

      <div className="space-y-3">
        <div>
          <span className="text-gray-500 text-xs">Evaluation</span>
          <div className="text-white font-mono text-lg">—</div>
        </div>

        <div>
          <span className="text-gray-500 text-xs">Best Move</span>
          <div className="text-white font-mono">—</div>
        </div>

        <div>
          <span className="text-gray-500 text-xs">Depth</span>
          <div className="text-white font-mono">—</div>
        </div>

        <div>
          <span className="text-gray-500 text-xs">Classification</span>
          <div className="text-white font-mono">—</div>
        </div>

        {fen && (
          <div className="pt-2 border-t border-gray-700">
            <span className="text-gray-500 text-xs">FEN</span>
            <div className="text-gray-600 font-mono text-[10px] break-all mt-1">{fen}</div>
          </div>
        )}
      </div>
    </div>
  );
};
