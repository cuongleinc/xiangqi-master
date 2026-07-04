import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { usePvPStore } from '../../stores/pvp.store';
import { useGameStore } from '../../stores/game.store';

const DOT = {
  connected: 'bg-green-400',
  reconnecting: 'bg-yellow-400 animate-pulse',
  disconnected: 'bg-red-400',
} as const;

export const ConnectionIndicator: React.FC = () => {
  const { t } = useTranslation();
  const matchType = useGameStore((s) => s.matchType);
  const connectionState = usePvPStore((s) => s.connectionState);
  const opponentDisconnected = usePvPStore((s) => s.opponentDisconnected);
  const disconnectCountdown = usePvPStore((s) => s.disconnectCountdown);
  const opponentName = usePvPStore((s) => s.opponentName);

  // Countdown timer for disconnect
  useEffect(() => {
    if (!opponentDisconnected || disconnectCountdown <= 0) return;
    const timer = setInterval(() => {
      const state = usePvPStore.getState();
      if (state.disconnectCountdown > 0) {
        usePvPStore.setState({ disconnectCountdown: state.disconnectCountdown - 1 });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [opponentDisconnected, disconnectCountdown]);

  if (matchType !== 'pvp' && matchType !== 'analysis') return null;

  let label: string;
  let dotColor: string;

  if (opponentDisconnected) {
    label = t('pvp.disconnectWarning', { seconds: disconnectCountdown });
    dotColor = DOT.reconnecting;
  } else if (connectionState === 'reconnecting') {
    label = t('pvp.connectionLost');
    dotColor = DOT.reconnecting;
  } else {
    label = opponentName
      ? t('pvp.playerNames', { red: '', black: '' }).replace(' vs ', '').trim() || `${opponentName}`
      : t('pvp.opponentTurn');
    dotColor = DOT.connected;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <span className={`inline-block w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-cream-dim text-xs font-serif truncate max-w-[180px]">
        {label}
      </span>
      {opponentDisconnected && (
        <span className="text-red-chinese text-xs font-bold animate-pulse">
          {disconnectCountdown}s
        </span>
      )}
    </div>
  );
};
