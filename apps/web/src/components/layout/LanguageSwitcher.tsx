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
    <div className="flex items-center gap-1">
      {SUPPORTED_LANGUAGES.map((lang) => {
        const isActive = current === lang.code;
        return (
          <button
            key={lang.code}
            onClick={() => handleChange(lang.code)}
            title={lang.label}
            className={`text-xs px-1.5 py-0.5 rounded transition-colors ${
              isActive
                ? 'bg-gold/20 text-gold-light border border-gold/40'
                : 'text-cream-dim/50 hover:text-cream-dim border border-transparent hover:border-gold/20'
            }`}
          >
            {lang.flag}
          </button>
        );
      })}
    </div>
  );
};
