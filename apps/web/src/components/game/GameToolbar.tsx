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

  const handleNewGame = () => openDialog('newGame');

  const handleHint = async () => {
    if (!gameId || hintsRemaining <= 0) return;
    try {
      const data = await gameApi.getHint(gameId);
      const fromFile = data.bestMove.charCodeAt(0) - 97;
      const fromRank = parseInt(data.bestMove[1]!);
      const toFile = data.bestMove.charCodeAt(2) - 97;
      const toRank = parseInt(data.bestMove[3]!);
      showHint([fromRank, fromFile], [toRank, toFile]);
    } catch { /* ignore */ }
  };

  return (
    <div className="bg-lacquer border border-gold/20 rounded-lg p-3 space-y-2">
      <button onClick={handleNewGame} className="w-full bg-gold hover:bg-gold-light text-ebony text-sm font-bold py-2 px-3 rounded transition-all duration-200 font-serif tracking-wide">
        New Game
      </button>
      <button onClick={handleHint} disabled={isAiThinking || hintsRemaining <= 0} className="w-full bg-lacquer border border-gold/30 hover:border-gold/60 disabled:border-gold/10 disabled:text-gold-dim/50 text-cream text-sm font-medium py-2 px-3 rounded transition-all duration-200">
        Hint ({hintsRemaining})
      </button>
      <button disabled={isAiThinking} className="w-full bg-lacquer border border-red-chinese/30 hover:border-red-chinese/60 disabled:border-gold/10 disabled:text-gold-dim/50 text-red-chinese text-sm font-medium py-2 px-3 rounded transition-all duration-200">
        Resign
      </button>

      <div className="pt-2 border-t border-gold/20 text-xs text-cream-dim space-y-1">
        <div className="truncate">ID: {gameId ? gameId.slice(0, 8) : '—'}</div>
        <div>{isAiThinking ? 'Thinking...' : 'Ready'}</div>
      </div>
    </div>
  );
};
