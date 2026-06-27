import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-lacquer border-b border-gold/30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 4px #d4a843)' }}>🏯</span>
        <h1 className="text-xl font-bold text-gold-light font-serif tracking-wide">Xiangqi Master</h1>
      </div>
      <span className="text-sm text-cream-dim font-serif">中國象棋</span>
    </header>
  );
};
