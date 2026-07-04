import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePvPStore } from '../../stores/pvp.store';

export const MatchmakingOverlay: React.FC = () => {
  const { t } = useTranslation();
  const isQueued = usePvPStore((s) => s.isQueued);
  const queuePosition = usePvPStore((s) => s.queuePosition);
  const leaveQueue = usePvPStore((s) => s.leaveQueue);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (usePvPStore.getState().isQueued) {
        leaveQueue();
      }
    };
  }, [leaveQueue]);

  if (!isQueued) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[300]">
      <div className="bg-lacquer border border-gold/40 rounded-xl p-8 max-w-sm mx-auto text-center shadow-2xl">
        {/* Spinning chess piece indicator */}
        <div className="mb-4">
          <span className="inline-block text-4xl animate-bounce">♞</span>
        </div>

        <h2 className="text-xl font-bold text-gold-light font-serif mb-2">
          {t('pvp.finding')}
        </h2>
        <p className="text-cream-dim text-sm mb-6 font-serif">
          {t('pvp.queuePosition', { pos: queuePosition })}
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-1 mb-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="inline-block w-2.5 h-2.5 rounded-full bg-gold animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>

        <button
          onClick={leaveQueue}
          className="bg-lacquer border border-gold/30 hover:border-gold/60 text-cream font-medium py-2 px-6 rounded-lg transition-all duration-200"
        >
          {t('pvp.cancel')}
        </button>
      </div>
    </div>
  );
};
