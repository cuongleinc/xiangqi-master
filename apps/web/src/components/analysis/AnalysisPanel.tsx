import React, { useMemo, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { useAnalysisStore } from '../../stores/analysis.store';
import { useGameStore } from '../../stores/game.store';
import { pvToReadable } from '../../lib/notation';

/* ── Info icon + portal tooltip (renders at document root to avoid clipping) ── */
const InfoTip: React.FC<{ label: string }> = ({ label }) => {
  const iconRef = useRef<HTMLSpanElement>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);

  const show = () => {
    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ top: rect.top + rect.height / 2, left: rect.left - 8 });
    }
  };
  const hide = () => setTooltipPos(null);

  return (
    <>
      <span ref={iconRef} className="inline-flex ml-1.5 cursor-help" onMouseEnter={show} onMouseLeave={hide}>
        <span className="text-cream-dim/50 text-xs leading-none select-none">ⓘ</span>
      </span>
      {tooltipPos &&
        createPortal(
          <div
            className="fixed px-2.5 py-1.5 bg-[#1a0f00] border border-gold/40 rounded text-xs text-cream whitespace-nowrap shadow-xl pointer-events-none"
            style={{
              top: tooltipPos.top,
              left: tooltipPos.left,
              transform: 'translate(-100%, -50%)',
              zIndex: 9999,
            }}
          >
            {label}
          </div>,
          document.body,
        )}
    </>
  );
};

interface AnalysisPanelProps {
  fen: string | null;
}

function formatScoreCp(cp: number | null, na: string): string {
  if (cp === null) return na;
  const pawns = cp / 100;
  if (pawns === 0) return '0.00';
  return pawns > 0 ? `+${pawns.toFixed(2)}` : pawns.toFixed(2);
}

/** Client-side classification fallback — mirrors xiangqi-core classifyMove logic. */
function classifyLocally(evalAfter: number, evalBefore: number): string {
  const playerBefore = evalBefore;
  const playerAfter = -evalAfter;
  const cpLoss = playerBefore - playerAfter;
  if (cpLoss <= 0) return 'BEST';
  if (cpLoss <= 5) return 'BEST';
  if (cpLoss <= 15) return 'EXCELLENT';
  if (cpLoss <= 50) return 'GOOD';
  if (cpLoss <= 100) return 'INACCURACY';
  if (cpLoss <= 200) return 'MISTAKE';
  return 'BLUNDER';
}

const CLASS_COLORS: Record<string, string> = {
  BEST: 'text-green-300',
  EXCELLENT: 'text-green-300/80',
  GOOD: 'text-gold-light',
  INACCURACY: 'text-gold',
  MISTAKE: 'text-red-300',
  BLUNDER: 'text-red-200',
};

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({ fen }) => {
  const { t } = useTranslation();
  const evaluation = useAnalysisStore((s) => s.evaluation);
  const bestMove = useAnalysisStore((s) => s.bestMove);
  const depth = useAnalysisStore((s) => s.depth);
  const pv = useAnalysisStore((s) => s.pv);
  const isEvaluating = useAnalysisStore((s) => s.isEvaluating);
  const moves = useGameStore((s) => s.moves);
  const makeMove = useGameStore((s) => s.makeMove);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const storeClassification = useAnalysisStore((s) => s.lastClassification);

  const na = t('common.notAvailable');

  // Classification priority:
  // 1. Backend classification from the last move record
  // 2. Client-side classification from move evalBefore/evalAfter
  // 3. Real-time classification from analysis store (set by GameLayout)
  const lastClassification = useMemo(() => {
    if (moves.length === 0) return storeClassification;
    const lastMove = moves[moves.length - 1];

    if (lastMove?.classification) return lastMove.classification;

    if (
      lastMove?.evaluationBefore != null &&
      lastMove?.evaluationAfter != null
    ) {
      return classifyLocally(lastMove.evaluationAfter, lastMove.evaluationBefore);
    }

    return storeClassification;
  }, [moves, storeClassification]);

  // Convert PV UCI strings to readable notation
  const readablePv = useMemo(() => {
    if (!fen || pv.length === 0) return [];
    return pvToReadable(pv, fen);
  }, [fen, pv]);

  // Map classification codes to translated labels
  const classLabels: Record<string, string> = {
    BEST: t('analysis.classification.best'),
    EXCELLENT: t('analysis.classification.excellent'),
    GOOD: t('analysis.classification.good'),
    INACCURACY: t('analysis.classification.inaccuracy'),
    MISTAKE: t('analysis.classification.mistake'),
    BLUNDER: t('analysis.classification.blunder'),
  };

  return (
    <div className="bg-[#150c00] rounded-lg">
      {/* Header */}
      <h3 className="text-gold font-serif text-xs tracking-[0.08em] uppercase px-3 py-2 border-b border-gold/30">
        {t('analysis.heading')}
      </h3>

      <div className="p-3 space-y-3.5 text-sm overflow-visible">
        {/* Evaluation */}
        <div>
          <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider">{t('analysis.evaluation')}</span>
          <div className="text-gold-light font-mono text-xl">
            {isEvaluating ? t('analysis.evaluating') : formatScoreCp(evaluation, na)}
          </div>
        </div>

        {/* Best Move — click to auto-play */}
        <div>
          <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider">{t('analysis.bestMove')}</span>
          {bestMove && !isAiThinking ? (
            <button
              onClick={() => makeMove(bestMove)}
              className="block w-full text-left font-mono text-base text-cream bg-transparent border-0 outline-none p-0 m-0 hover:text-gold-light hover:underline transition-colors focus:outline-none appearance-none"
              title={t('analysis.bestMove.tooltip')}
            >
              {bestMove}
            </button>
          ) : (
            <div className="text-cream font-mono text-base">{bestMove ?? na}</div>
          )}
        </div>

        {/* Depth */}
        <div>
          <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider">{t('analysis.depth')}</span>
          <div className="text-cream font-mono text-sm">{depth !== null ? `${depth}` : na}</div>
        </div>

        {/* PV — Principal Variation */}
        {readablePv.length > 0 && (
          <div>
            <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider inline-flex items-center">
              {t('analysis.pv')}
              <InfoTip label={t('analysis.pv.tooltip')} />
            </span>
            <div className="text-cream-dim font-mono text-xs break-all mt-0.5 leading-relaxed">
              {readablePv.join(' ')}
            </div>
          </div>
        )}

        {/* Classification */}
        <div>
          <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider inline-flex items-center">
            {t('analysis.classification')}
            <InfoTip label={t('analysis.classification.tooltip')} />
          </span>
          <div className={`font-mono text-sm font-semibold ${lastClassification ? CLASS_COLORS[lastClassification] || 'text-cream' : 'text-cream'}`}>
            {(lastClassification && classLabels[lastClassification]) || na}
          </div>
        </div>

        {/* FEN */}
        {fen && (
          <div className="pt-2 border-t border-[#3d2010]">
            <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider">{t('analysis.fen')}</span>
            <div className="text-cream-dim/50 font-mono text-[11px] break-all mt-1">{fen}</div>
          </div>
        )}
      </div>
    </div>
  );
};
