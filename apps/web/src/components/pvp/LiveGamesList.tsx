import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePvPStore } from '../../stores/pvp.store';

export const LiveGamesList: React.FC = () => {
  const { t } = useTranslation();
  const liveGames = usePvPStore((s) => s.liveGames);
  const fetchLiveGames = usePvPStore((s) => s.fetchLiveGames);
  const spectateGame = usePvPStore((s) => s.spectateGame);
  const isSpectating = usePvPStore((s) => s.isSpectating);
  const myGameId = usePvPStore((s) => s.gameId);

  // Filter out own game
  const otherGames = liveGames.filter((g) => g.gameId !== myGameId);

  useEffect(() => {
    fetchLiveGames();
    // Poll for updates every 5s
    const interval = setInterval(fetchLiveGames, 5000);
    return () => clearInterval(interval);
  }, [fetchLiveGames]);

  if (isSpectating) return null;

  return (
    <div className="border-t border-gold/20 pt-3 mt-3">
      <h3 className="text-cream-dim/60 text-[11px] uppercase tracking-wider mb-2 font-sans">
        {t('pvp.liveGames')}
      </h3>

      {otherGames.length === 0 ? (
        <p className="text-cream-dim/40 text-xs italic font-serif">
          {t('pvp.noLiveGames')}
        </p>
      ) : (
        <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
          {otherGames.map((game) => (
            <div
              key={game.gameId}
              className="flex items-center justify-between py-1 px-2 rounded hover:bg-gold/5 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-cream/70 text-xs truncate font-serif">
                  {game.redName} <span className="text-cream-dim/40">vs</span> {game.blackName}
                </p>
                <p className="text-cream-dim/40 text-[10px]">
                  {game.moveCount} moves
                  {game.spectatorCount > 0 && (
                    <span className="ml-2">
                      {t('pvp.spectatorCount', { count: game.spectatorCount })}
                    </span>
                  )}
                </p>
              </div>
              <button
                onClick={() => spectateGame(game.gameId)}
                className="text-gold hover:text-gold-light text-xs font-serif ml-2 flex-shrink-0 transition-colors"
              >
                {t('pvp.spectate')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
