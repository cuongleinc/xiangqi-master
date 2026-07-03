import React, { useEffect } from 'react';
import { useGameStore } from './stores/game.store';
import { useUiStore } from './stores/ui.store';
import { Header } from './components/layout/Header';
import { GameLayout } from './components/layout/GameLayout';
import { NewGameDialog } from './components/game/NewGameDialog';
import { GameOverDialog } from './components/game/GameOverDialog';
import { AboutDialog } from './components/layout/AboutDialog';
import { ConfirmDialog } from './components/layout/ConfirmDialog';

const App: React.FC = () => {
  const gameId = useGameStore((s) => s.gameId);
  const status = useGameStore((s) => s.status);
  const moveCount = useGameStore((s) => s.moveCount);
  const activeDialog = useUiStore((s) => s.activeDialog);

  // Warn on page reload/close if game is in progress
  useEffect(() => {
    if (!gameId || moveCount === 0) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [gameId, moveCount]);

  if (!gameId) {
    return (
      <>
        <NewGameDialog isInitial />
        {activeDialog === 'about' && <AboutDialog />}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0800] text-cream">
      <Header />
      <GameLayout />
      {status !== 'playing' && <GameOverDialog />}
      {activeDialog === 'about' && <AboutDialog />}
      <ConfirmDialog />
    </div>
  );
};

export default App;
