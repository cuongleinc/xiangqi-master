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
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const currentTurn: Color = fen?.includes(' w ') ? Color.RED : Color.BLACK;

  return (
    <div className="flex h-[calc(100vh-56px-36px)] max-w-[1400px] mx-auto">
      {/* Left sidebar — Controls */}
      <div className="w-[220px] flex-shrink-0 bg-[#1e1005] border-r border-[#3d2010] overflow-y-auto">
        <div className="p-3">
          <GameToolbar />
        </div>
      </div>

      {/* Center — Board + Eval */}
      <div className="flex-1 flex items-start justify-center p-3 gap-2 min-w-0">
        <EvaluationBar fen={fen} isThinking={isAiThinking} />
        <div className="flex-1">
          <Board fen={fen} turn={currentTurn} />
        </div>
      </div>

      {/* Right sidebar — Analysis */}
      <div className="w-[220px] flex-shrink-0 bg-[#1e1005] border-l border-[#3d2010] overflow-y-auto">
        <div className="p-3 space-y-3">
          <AnalysisPanel fen={fen} />
          <MoveList />
        </div>
      </div>

      <StatusBar />
    </div>
  );
};
