import React from 'react';
import { useGameStore } from './stores/game.store';
import { Header } from './components/layout/Header';
import { GameLayout } from './components/layout/GameLayout';
import { NewGameDialog } from './components/game/NewGameDialog';
import { GameOverDialog } from './components/game/GameOverDialog';

const App: React.FC = () => {
  const gameId = useGameStore((s) => s.gameId);
  const status = useGameStore((s) => s.status);

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white">
      <Header />
      {gameId ? (
        <GameLayout />
      ) : (
        <div className="flex items-center justify-center h-[80vh]">
          <NewGameDialog isInitial />
        </div>
      )}
      {status !== 'playing' && gameId && <GameOverDialog />}
    </div>
  );
};

export default App;
