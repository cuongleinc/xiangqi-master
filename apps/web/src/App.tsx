import React from 'react';
import { useGameStore } from './stores/game.store';
import { useUiStore } from './stores/ui.store';
import { Header } from './components/layout/Header';
import { GameLayout } from './components/layout/GameLayout';
import { NewGameDialog } from './components/game/NewGameDialog';
import { GameOverDialog } from './components/game/GameOverDialog';
import { AboutDialog } from './components/layout/AboutDialog';

const App: React.FC = () => {
  const gameId = useGameStore((s) => s.gameId);
  const status = useGameStore((s) => s.status);
  const activeDialog = useUiStore((s) => s.activeDialog);

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
    </div>
  );
};

export default App;
