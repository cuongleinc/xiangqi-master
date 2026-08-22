import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../../stores/ui.store';

export const ConfirmDialog: React.FC = () => {
  const { t } = useTranslation();
  const confirmMessage = useUiStore((s) => s.confirmMessage);
  const confirmCallback = useUiStore((s) => s.confirmCallback);
  const clearConfirm = useUiStore((s) => s.clearConfirm);

  if (!confirmMessage) return null;

  const handleConfirm = () => {
    clearConfirm();
    confirmCallback?.();
  };

  const handleCancel = () => {
    clearConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[250]" onClick={handleCancel}>
      <div
        className="bg-lacquer border border-gold/40 rounded-xl p-6 max-w-sm mx-4 text-center shadow-2xl"
        style={{ boxShadow: '0 0 40px rgba(212,168,67,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-cream font-serif text-sm leading-relaxed mb-6">
          {confirmMessage}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleCancel}
            className="px-6 py-2 bg-transparent border border-gold/30 hover:border-gold/60 text-cream-dim hover:text-cream rounded-lg text-sm font-serif transition-colors"
          >
            {t('confirm.cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="px-6 py-2 bg-gold hover:bg-gold-light text-ebony font-bold rounded-lg text-sm font-serif transition-colors"
          >
            {t('confirm.ok')}
          </button>
        </div>
      </div>
    </div>
  );
};
