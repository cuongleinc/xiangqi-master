import React from 'react';
import { useGameStore } from '../../stores/game.store';
import { gameApi } from '../../api/game.api';
import { analysisApi } from '../../api/analysis.api';
import { useUiStore } from '../../stores/ui.store';
import { FILE_MAP } from '@repo/shared';

const btnBase = 'w-full py-3 px-5 font-medium text-sm tracking-[0.03em] rounded-md transition-all duration-200 font-serif';

export const GameToolbar: React.FC = () => {
  const gameId = useGameStore((s) => s.gameId);
  const fen = useGameStore((s) => s.fen);
  const hintsRemaining = useGameStore((s) => s.hintsRemaining);
  const isAiThinking = useGameStore((s) => s.isAiThinking);
  const matchType = useGameStore((s) => s.matchType);
  const moveCount = useGameStore((s) => s.moveCount);
  const makeMove = useGameStore((s) => s.makeMove);
  const undoMove = useGameStore((s) => s.undoMove);
  const openDialog = useUiStore((s) => s.openDialog);
  const showHint = useUiStore((s) => s.showHint);

  const handleNewGame = () => openDialog('newGame');

  const handleHint = async () => {
    if (!gameId || hintsRemaining <= 0) return;
    try {
      const data = await gameApi.getHint(gameId);
      const uci: string = data.bestMove;
      const fromFile = FILE_MAP[uci[0]!];
      const fromRank = parseInt(uci[1]!, 10);
      const toFile = FILE_MAP[uci[2]!];
      const toRank = parseInt(uci[3]!, 10);
      if (fromFile === undefined || toFile === undefined || isNaN(fromRank) || isNaN(toRank)) return;
      showHint([fromRank, fromFile], [toRank, toFile]);
    } catch { /* ignore */ }
  };

  const handleBestMove = async () => {
    if (!fen || !gameId) return;
    try {
      const data = await analysisApi.bestMove(fen);
      if (data.bestMove) {
        await makeMove(data.bestMove);
      }
    } catch { /* ignore */ }
  };

  const handleUndo = async () => {
    if (!gameId) return;
    try {
      await undoMove();
    } catch { /* ignore */ }
  };

  const isAnalysisOrPvP = matchType === 'analysis' || matchType === 'pvp';

  return (
    <div className="space-y-3">
      {/* New Game */}
      <button
        onClick={handleNewGame}
        className={`${btnBase} text-gold-light border border-gold shadow-sm`}
        style={{
          background: 'linear-gradient(135deg, #8B1A1A 0%, #c0392b 100%)',
          boxShadow: '0 2px 8px rgba(139,26,26,0.3)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(1.12)')}
        onMouseLeave={(e) => (e.currentTarget.style.filter = 'brightness(1)')}
      >
        新局 · New Game
      </button>

      {/* Hint (PvC only) */}
      {matchType === 'pvc' && (
        <button
          onClick={handleHint}
          disabled={isAiThinking || hintsRemaining <= 0}
          className={`${btnBase} text-cream border border-gold/40 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed`}
          style={{
            background: 'linear-gradient(135deg, #6b4c1a 0%, #a07020 100%)',
            boxShadow: '0 2px 8px rgba(107,76,26,0.3)',
          }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.12)'; }}
          onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          提示 · Hint ({hintsRemaining})
        </button>
      )}

      {/* Best Move (Analysis / PvP) */}
      {isAnalysisOrPvP && (
        <button
          onClick={handleBestMove}
          disabled={isAiThinking || !fen}
          className={`${btnBase} text-cream border border-gold/40 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed`}
          style={{
            background: 'linear-gradient(135deg, #1a5c2a 0%, #2a8c40 100%)',
            boxShadow: '0 2px 8px rgba(26,92,42,0.3)',
          }}
          onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.12)'; }}
          onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1)'; }}
        >
          Best Move
        </button>
      )}

      {/* Undo */}
      <button
        onClick={handleUndo}
        disabled={isAiThinking || moveCount === 0}
        className={`${btnBase} text-cream border border-gold/40 shadow-sm disabled:opacity-30 disabled:cursor-not-allowed`}
        style={{
          background: 'linear-gradient(135deg, #4a3520 0%, #7a5530 100%)',
          boxShadow: '0 2px 8px rgba(74,53,32,0.3)',
        }}
        onMouseEnter={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1.12)'; }}
        onMouseLeave={(e) => { if (!e.currentTarget.disabled) e.currentTarget.style.filter = 'brightness(1)'; }}
      >
        悔棋 · Undo
      </button>

      {/* Resign */}
      <button
        disabled={isAiThinking}
        className={`${btnBase} text-[#a07840] bg-transparent border border-[#8B4513] hover:bg-[#8B4513]/10 disabled:opacity-30 disabled:cursor-not-allowed`}
      >
        認負 · Resign
      </button>

      {/* Sep */}
      <div className="border-t border-[#3d2010] pt-3 mt-3">
        <div className="text-[#a07840] text-xs space-y-1 font-mono">
          <div className="flex justify-between">
            <span className="text-cream-dim">Game</span>
            <span>{gameId ? gameId.slice(0, 8) : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cream-dim">Status</span>
            <span className={isAiThinking ? 'text-gold animate-pulse' : 'text-jade'}>
              {isAiThinking ? 'Thinking' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
