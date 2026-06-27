import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { Color } from '@repo/shared';
import { Board } from '../board/Board';
import { EvaluationBar } from '../analysis/EvaluationBar';
import { AnalysisPanel } from '../analysis/AnalysisPanel';
import { GameToolbar } from '../game/GameToolbar';
import { MoveList } from '../game/MoveList';
import { StatusBar } from './StatusBar';

export const GameLayout: React.FC = () => {
  const fen = useGameStore((s) => s.fen);
  const turn = useGameStore((s) => s.turn);
  const status = useGameStore((s) => s.status);
  const isAiThinking = useGameStore((s) => s.isAiThinking);

  // Parse turn from FEN
  const currentTurn: Color = fen?.includes(' w ') ? Color.RED : Color.BLACK;

  return (
    <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-[1200px] mx-auto">
      {/* Left sidebar: Toolbar */}
      <div className="lg:w-48 flex-shrink-0">
        <GameToolbar />
      </div>

      {/* Center: Board + Evaluation Bar */}
      <div className="flex gap-2 items-stretch flex-1 justify-center">
        <EvaluationBar fen={fen} isThinking={isAiThinking} />
        <div className="flex-1">
          <Board fen={fen} turn={currentTurn} />
        </div>
      </div>

      {/* Right panel: Analysis + Move List */}
      <div className="lg:w-72 flex-shrink-0 space-y-4">
        <AnalysisPanel fen={fen} />
        <MoveList />
      </div>

      <StatusBar />
    </div>
  );
};
