import React from 'react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '../../stores/ui.store';

export const AboutDialog: React.FC = () => {
  const { t } = useTranslation();
  const closeDialog = useUiStore((s) => s.closeDialog);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]" onClick={closeDialog}>
      <div
        className="bg-lacquer border border-gold/40 rounded-xl p-8 max-w-lg mx-4 text-center shadow-2xl"
        style={{ boxShadow: '0 0 40px rgba(212,168,67,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-3xl" style={{ filter: 'drop-shadow(0 0 4px #d4a843)' }}>🏯</span>
          <h2 className="text-2xl font-bold text-gold-light font-serif">Xiangqi Master</h2>
        </div>

        {/* Engine Credit */}
        <div className="mb-6 p-4 bg-[#150c00] rounded-lg border border-gold/20">
          <h3 className="text-sm font-semibold text-gold font-serif tracking-wide mb-2">
            {t('about.engine.title')}
          </h3>
          <p className="text-cream-dim text-sm leading-relaxed">
            {t('about.engine.description')}
          </p>
          <a
            href="https://github.com/official-pikafish/Pikafish"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 text-xs text-gold hover:text-gold-light underline transition-colors"
          >
            github.com/official-pikafish/Pikafish
          </a>
        </div>

        {/* Author */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gold font-serif tracking-wide mb-2">
            {t('about.author.title')}
          </h3>
          <p className="text-cream font-serif text-lg">Cuong Le</p>
          <p className="text-cream-dim text-xs mt-0.5">Ho Chi Minh City</p>
          <div className="flex items-center justify-center gap-3 mt-2">
            <a
              href="https://github.com/cuongleinc"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold hover:text-gold-light underline transition-colors"
            >
              github.com/cuongleinc
            </a>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mb-6 p-4 bg-[#150c00] rounded-lg border border-gold/20">
          <h3 className="text-sm font-semibold text-gold font-serif tracking-wide mb-2">
            {t('about.tech.title')}
          </h3>
          <div className="text-cream-dim text-xs leading-relaxed space-y-0.5">
            <p>React 18 &middot; Vite &middot; TailwindCSS &middot; Zustand</p>
            <p>NestJS &middot; TypeORM &middot; PostgreSQL &middot; Redis</p>
            <p>Pikafish NNUE &middot; Docker &middot; Nginx</p>
          </div>
        </div>

        {/* License */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gold font-serif tracking-wide mb-2">
            {t('about.license.title')}
          </h3>
          <p className="text-cream-dim text-xs">
            MIT &copy; 2026 &middot;{' '}
            <a
              href="https://github.com/cuongleinc/xiangqi-master"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold hover:text-gold-light underline transition-colors"
            >
              github.com/cuongleinc/xiangqi-master
            </a>
          </p>
        </div>

        {/* Version */}
        <p className="text-cream-dim/40 text-[10px] font-mono">
          v1.0.0 &mdash; {t('about.tagline')}
        </p>

        {/* Close */}
        <button
          onClick={closeDialog}
          className="mt-6 px-6 py-2 bg-gold/10 border border-gold/30 hover:bg-gold/20 text-gold-light rounded-lg text-sm font-serif transition-colors"
        >
          {t('about.close')}
        </button>
      </div>
    </div>
  );
};
