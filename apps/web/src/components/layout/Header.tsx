import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../../stores/ui.store';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Header: React.FC = () => {
  const { t } = useTranslation();
  const openDialog = useUiStore((s) => s.openDialog);

  return (
    <header className="bg-lacquer border-b border-gold/30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-2xl" style={{ filter: 'drop-shadow(0 0 4px #d4a843)' }}>🏯</span>
        <h1 className="text-xl font-bold text-gold-light font-serif tracking-wide">{t('header.title')}</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => openDialog('about')}
          className="text-xs text-cream-dim/60 hover:text-gold-light transition-colors font-serif tracking-wide"
        >
          {t('header.about')}
        </button>
        <LanguageSwitcher />
        <span className="text-sm text-cream-dim font-serif">{t('header.subtitle')}</span>
      </div>
    </header>
  );
};
