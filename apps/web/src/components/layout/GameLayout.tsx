import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game.store';
import { useAnalysisStore } from '../../stores/analysis.store';
import { Color, MoveClassification } from '@repo/shared';
import { Board } from '../board/Board';
import { EvaluationBar } from '../analysis/EvaluationBar';
import { AnalysisPanel } from '../analysis/AnalysisPanel';
import { GameToolbar } from '../game/GameToolbar';
import { MoveList } from '../game/MoveList';
import { StatusBar } from './StatusBar';
import { ConnectionIndicator } from '../pvp/ConnectionIndicator';
import { LiveGamesList } from '../pvp/LiveGamesList';
import { PvPInfoPanel } from '../pvp/PvPInfoPanel';

export const GameLayout: React.FC = () => {
  const { t } = useTranslation();
  const fen = useGameStore((s) => s.fen);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const matchType = useGameStore((s) => s.matchType);
  const isPvP = matchType === 'pvp';
  const evaluatePosition = useAnalysisStore((s) => s.evaluatePosition);
  const evaluation = useAnalysisStore((s) => s.evaluation);
  const setClassification = useAnalysisStore((s) => s.setClassification);
  const currentTurn: Color = fen?.includes(' w ') ? Color.RED : Color.BLACK;

  // Re-evaluate position whenever the FEN changes (after each move)
  const prevFenRef = useRef<string | null>(null);
  const prevEvalRef = useRef<number | null>(null);
  const evalGenRef = useRef(0);
  const pendingGenRef = useRef(0);
  const _epoch = useGameStore((s) => s._epoch);

  // Reset prevEvalRef on undo/new-game to prevent classification with wrong eval pair
  useEffect(() => {
    prevEvalRef.current = null;
  }, [_epoch]);

  useEffect(() => {
    if (fen && fen !== prevFenRef.current && !isPvP) {
      const gen = ++evalGenRef.current;
      pendingGenRef.current = gen;
      prevFenRef.current = fen;
      evaluatePosition(fen);
    }
  }, [fen, evaluatePosition, isPvP]);

  // When the engine eval arrives after a FEN change, classify the move
  useEffect(() => {
    // Only classify if:
    // 1. A FEN change is pending classification (pendingGen > 0)
    // 2. No newer FEN change occurred while eval was in-flight (gen matches)
    // 3. Evaluation is available
    // 4. We have a previous eval to compare (won't be after undo/new-game)
    if (pendingGenRef.current > 0 && pendingGenRef.current === evalGenRef.current
        && evaluation !== null && prevEvalRef.current !== null) {
      const prev = prevEvalRef.current;
      // evaluation is from the new side-to-move (opponent of the player who moved).
      // Negate to get the moving player's perspective, then compare.
      const playerAfter = -evaluation;
      const cpLoss = prev - playerAfter;
      let cls: MoveClassification = MoveClassification.BEST;
      if (cpLoss > 200) cls = MoveClassification.BLUNDER;
      else if (cpLoss > 100) cls = MoveClassification.MISTAKE;
      else if (cpLoss > 50) cls = MoveClassification.INACCURACY;
      else if (cpLoss > 15) cls = MoveClassification.GOOD;
      else if (cpLoss > 5) cls = MoveClassification.EXCELLENT;
      setClassification(cls);
      pendingGenRef.current = 0; // mark as consumed
    }
    prevEvalRef.current = evaluation;
  }, [evaluation, setClassification]);

  return (
    <div className="flex h-[calc(100vh-56px)] max-w-[1400px] mx-auto">
      {/* Left sidebar — Controls */}
      <div className="w-[220px] flex-shrink-0 bg-[#1e1005] border-r border-[#3d2010] overflow-y-auto">
        <div className="p-3">
          <ConnectionIndicator />
          <GameToolbar />
          <LiveGamesList />
        </div>
      </div>

      {/* Center — Board (no eval bar in PvP) */}
      <div className="flex-1 flex items-start justify-center p-3 gap-2 min-w-0">
        {!isPvP && <EvaluationBar fen={fen} isThinking={isAiThinking} />}
        <div className="flex-1">
          <Board fen={fen} turn={currentTurn} />
        </div>
      </div>

      {/* Right sidebar — Analysis or PvP info */}
      <div className="w-[220px] flex-shrink-0 bg-[#1e1005] border-l border-[#3d2010] overflow-y-auto">
        <div className="p-3 space-y-3">
          {isPvP ? (
            <PvPInfoPanel />
          ) : (
            <AnalysisPanel fen={fen} />
          )}
          <MoveList />
        </div>
      </div>

      <StatusBar />

      {/* Author footer */}
      <div className="fixed bottom-0 left-0 right-0 text-center pointer-events-none pb-3" style={{ zIndex: 5 }}>
        <span className="text-cream-dim/40 text-[13px] font-serif">
          &copy; {new Date().getFullYear()}{' '}
          <a
            href="https://github.com/cuongleinc"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gold transition-colors pointer-events-auto"
          >
            Cuong Le
          </a>
          {' — '}{t('footer.tagline')}
        </span>
      </div>
    </div>
  );
};
