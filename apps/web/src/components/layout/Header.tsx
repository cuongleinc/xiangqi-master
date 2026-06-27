import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-[#16213e] border-b border-gray-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl">🏯</span>
        <h1 className="text-xl font-bold text-white">Xiangqi Master</h1>
      </div>
      <span className="text-sm text-gray-400">Chinese Chess</span>
    </header>
  );
};
