import React from 'react';
import { useGameStore } from './stores/game.store';
import { Header } from './components/layout/Header';
import { GameLayout } from './components/layout/GameLayout';
import { NewGameDialog } from './components/game/NewGameDialog';
import { GameOverDialog } from './components/game/GameOverDialog';

const App: React.FC = () => {
  const gameId = useGameStore((s) => s.gameId);
  const status = useGameStore((s) => s.status);

  if (!gameId) {
    return <NewGameDialog isInitial />;
  }

  return (
    <div className="min-h-screen bg-[#0d0800] text-cream">
      <Header />
      <GameLayout />
      {status !== 'playing' && <GameOverDialog />}
    </div>
  );
};

export default App;
