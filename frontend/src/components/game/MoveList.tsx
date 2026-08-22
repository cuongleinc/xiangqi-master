import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game.store';
import { uciToReadable } from '../../lib/notation';
import { classifyMove } from '@repo/xiangqi-core';
import { Color, DEFAULT_THRESHOLDS } from '@repo/shared';

const CLASS_STYLES: Record<string, string> = {
  BEST: 'text-green-300',
  EXCELLENT: 'text-green-300/80',
  GOOD: 'text-gold-light',
  INACCURACY: 'text-gold',
  MISTAKE: 'text-red-300',
  BLUNDER: 'text-red-200',
};

const CLASS_DOT: Record<string, string> = {
  BEST: 'bg-green-400',
  EXCELLENT: 'bg-green-400/70',
  GOOD: 'bg-gold-light',
  INACCURACY: 'bg-yellow-500',
  MISTAKE: 'bg-orange-400',
  BLUNDER: 'bg-red-400',
};

const CLASS_ANNOTATION: Record<string, string> = {
  BEST: '',
  EXCELLENT: '!',
  GOOD: '',
  INACCURACY: '?!',
  MISTAKE: '?',
  BLUNDER: '??',
};

export const MoveList: React.FC = () => {
  const { t } = useTranslation();
  const moves = useGameStore((s) => s.moves);
  const moveCount = useGameStore((s) => s.moveCount);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest move
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moveCount]);

  // Pair moves: [Red, Black] per row
  const rows: Array<{
    moveNum: number;
    red: (typeof moves)[0] | null;
    black: (typeof moves)[0] | null;
  }> = [];

  for (let i = 0; i < moves.length; i += 2) {
    rows.push({
      moveNum: Math.floor(i / 2) + 1,
      red: moves[i] || null,
      black: moves[i + 1] || null,
    });
  }

  // Render a single move cell
  const renderCell = (
    move: (typeof moves)[0] | null,
    moveIdx: number,
    isRed: boolean,
  ) => {
    if (!move) {
      return <div className="flex-1 min-w-0" key={moveIdx} />;
    }

    const isLatest = moveIdx === moves.length - 1;
    const readable = uciToReadable(move.uci, move.fenBefore);
    const cls =
      move.classification ||
      (move.evaluationBefore != null && move.evaluationAfter != null
        ? classifyMove(move.evaluationAfter, move.evaluationBefore, Color.RED, DEFAULT_THRESHOLDS)
        : null);
    const dotColor = cls ? CLASS_DOT[cls] : 'bg-cream-dim/30';
    const label = cls ? CLASS_ANNOTATION[cls] : '';

    const tooltipParts: string[] = [`${move.uci} → ${readable}`];
    if (move.isCheck) tooltipParts.push(t('moves.indicator.check'));
    if (move.isCapture) tooltipParts.push(t('moves.indicator.capture'));

    return (
      <div
        key={moveIdx}
        className={`flex-1 min-w-0 flex items-center gap-1 px-1.5 py-1 rounded-sm transition-colors cursor-default ${
          isLatest
            ? 'bg-gold/15'
            : isRed
              ? 'hover:bg-[#3d2010]/20'
              : 'hover:bg-[#2a1a20]/20'
        }`}
        title={tooltipParts.join(' ')}
      >
        {/* Classification dot */}
        <span
          className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor}`}
        />

        {/* Move notation */}
        <span
          className={`flex-1 text-xs truncate ${
            isLatest ? 'text-gold-light font-semibold' : 'text-cream/80'
          }`}
        >
          {readable}
          {move.isCheck ? t('moves.indicator.check') : ''}
          {move.isCapture ? t('moves.indicator.capture') : ''}
        </span>

        {/* Annotation symbol */}
        {label && (
          <span className={`text-[10px] font-bold flex-shrink-0 ${CLASS_STYLES[cls!] || 'text-cream-dim'}`}>
            {label}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="bg-[#150c00] rounded-lg">
      {/* Header */}
      <h3 className="text-gold font-serif text-xs tracking-[0.08em] uppercase px-3 py-2 border-b border-gold/30">
        {t('moves.heading')}
      </h3>

      <div className="p-2">
        {moves.length === 0 ? (
          <p className="text-cream-dim/40 text-xs text-center py-4">{t('moves.empty')}</p>
        ) : (
          <div
            ref={scrollRef}
            className="max-h-64 overflow-y-auto scrollbar-thin"
          >
            {/* Column headers */}
            <div className="flex items-center gap-1 mb-1 text-[10px] text-cream-dim/50 font-semibold uppercase tracking-wider">
              <span className="w-7 text-center flex-shrink-0">{t('moves.columnNumber')}</span>
              <span className="flex-1 px-1.5">{t('moves.columnRed')}</span>
              <span className="flex-1 px-1.5">{t('moves.columnBlack')}</span>
            </div>

            {rows.map((row) => {
              const redIdx = (row.moveNum - 1) * 2;
              const blackIdx = redIdx + 1;

              return (
                <div key={row.moveNum} className="flex items-center gap-1">
                  {/* Move number */}
                  <span className="w-7 text-right text-[10px] text-cream-dim/40 flex-shrink-0 font-mono">
                    {row.moveNum}.
                  </span>

                  {/* Red's move */}
                  {renderCell(row.red, redIdx, true)}

                  {/* Black's move */}
                  {renderCell(row.black, blackIdx, false)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
