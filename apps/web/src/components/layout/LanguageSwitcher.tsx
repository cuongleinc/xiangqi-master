import React from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, setLocale, getCurrentLocale } from '../../i18n';
import type { SupportedLocale } from '../../i18n';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const current = getCurrentLocale();

  const handleChange = (locale: SupportedLocale) => {
    setLocale(locale);
  };

  return (
    <div className="flex items-center gap-2">
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            title={lang.label}
            className={`text-lg px-2.5 py-1.5 rounded-md transition-all duration-200 ${
              isActive
                ? 'bg-gold/25 text-gold-light border border-gold/60 shadow-sm'
                : 'text-cream-dim/40 hover:text-cream-dim/80 border border-transparent hover:border-gold/25 hover:scale-110 grayscale-[30%] hover:grayscale-0'
            }`}
            style={isActive ? { boxShadow: '0 0 8px rgba(212,168,67,0.25)' } : undefined}
          >
            {lang.flag}
          </button>
        );
      })}
    </div>
  );
};
