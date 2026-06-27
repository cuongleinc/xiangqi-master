import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { gameApi } from '../../api/game.api';
import { useUiStore } from '../../stores/ui.store';

export const GameToolbar: React.FC = () => {
  const gameId = useGameStore((s) => s.gameId);
  const hintsRemaining = useGameStore((s) => s.hintsRemaining);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const openDialog = useUiStore((s) => s.openDialog);
  const showHint = useUiStore((s) => s.showHint);

  const handleNewGame = () => {
    openDialog('newGame');
  };

  const handleHint = async () => {
    if (!gameId || hintsRemaining <= 0) return;
    try {
      const data = await gameApi.getHint(gameId);
      // Parse UCCI to get from/to
      const fromFile = data.bestMove.charCodeAt(0) - 97;
      const fromRank = parseInt(data.bestMove[1]!);
      const toFile = data.bestMove.charCodeAt(2) - 97;
      const toRank = parseInt(data.bestMove[3]!);
      showHint([fromRank, fromFile], [toRank, toFile]);
    } catch (err) {
      console.error('Hint failed:', err);
    }
  };

  const handleResign = () => {
    // Future: resign functionality
  };

  return (
    <div className="bg-[#16213e] rounded-lg p-3 space-y-2">
      <button
        onClick={handleNewGame}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
      >
        New Game
      </button>

      <button
        onClick={handleHint}
        disabled={isAiThinking || hintsRemaining <= 0}
        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
      >
        Hint ({hintsRemaining})
      </button>

      <button
        onClick={handleResign}
        disabled={isAiThinking}
        className="w-full bg-red-700 hover:bg-red-800 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
      >
        Resign
      </button>

      <div className="pt-2 border-t border-gray-700 text-xs text-gray-500 space-y-1">
        <div>Game ID: {gameId ? gameId.slice(0, 8) : '—'}</div>
        <div>Status: {isAiThinking ? 'Thinking...' : 'Ready'}</div>
      </div>
    </div>
  );
};
