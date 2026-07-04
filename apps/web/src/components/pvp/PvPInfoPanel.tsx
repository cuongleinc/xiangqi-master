import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '../../stores/game.store';
import { usePvPStore } from '../../stores/pvp.store';
import { getPvpSocket } from '../../api/socket';

export const PvPInfoPanel: React.FC = () => {
  const { t } = useTranslation();
  const fen = useGameStore((s) => s.fen);
  const moveCount = useGameStore((s) => s.moveCount);
  const opponentName = usePvPStore((s) => s.opponentName);
  const playerColor = usePvPStore((s) => s.playerColor);
  const [spectatorCount, setSpectatorCount] = useState(0);

  useEffect(() => {
    const socket = getPvpSocket();
    const handler = (data: { count: number }) => setSpectatorCount(data.count);
    socket.on('spectator_count', handler);
    return () => { socket.off('spectator_count', handler); };
  }, []);

  const turn = fen?.includes(' w ') ? 'red' : 'black';
  const isMyTurn = playerColor === turn;
  const myName = playerColor === 'red' ? t('common.red') : t('common.black');
  const oppName = opponentName || (playerColor === 'red' ? t('common.black') : t('common.red'));

  return (
    <div>
      <h3 className="text-cream-dim/60 text-[11px] uppercase tracking-wider mb-2 font-sans">
        PvP MATCH
      </h3>

      {/* Players */}
      <div className="space-y-1.5 mb-3">
        <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${playerColor === 'red' ? 'bg-red-chinese/10' : ''}`}>
          <span className="w-2 h-2 rounded-full bg-red-chinese flex-shrink-0" />
          <span className="text-cream/80 font-serif truncate">
            {playerColor === 'red' ? myName : oppName}
            {playerColor === 'red' && <span className="text-cream-dim/40 ml-1">(you)</span>}
          </span>
        </div>
        <div className={`flex items-center gap-2 px-2 py-1 rounded text-xs ${playerColor === 'black' ? 'bg-red-chinese/10' : ''}`}>
          <span className="w-2 h-2 rounded-full bg-[#333] border border-cream-dim/30 flex-shrink-0" />
          <span className="text-cream/80 font-serif truncate">
            {playerColor === 'black' ? myName : oppName}
            {playerColor === 'black' && <span className="text-cream-dim/40 ml-1">(you)</span>}
          </span>
        </div>
      </div>

      {/* Turn indicator */}
      <div className="mb-3 px-2">
        <span className={`text-xs font-semibold font-serif ${isMyTurn ? 'text-green-400' : 'text-cream-dim/60'}`}>
          {isMyTurn ? t('pvp.yourTurn') : t('pvp.opponentTurn')}
        </span>
      </div>

      {/* Move count */}
      <div className="mb-3">
        <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider">MOVES</span>
        <div className="text-cream font-mono text-base">{moveCount}</div>
      </div>

      {/* Spectator count */}
      {spectatorCount > 0 && (
        <div>
          <span className="text-cream-dim/60 text-[11px] uppercase tracking-wider">SPECTATORS</span>
          <div className="text-cream font-mono text-base">
            {t('pvp.spectatorCount', { count: spectatorCount })}
          </div>
        </div>
      )}
    </div>
  );
};
