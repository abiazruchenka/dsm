import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';
import 'flag-icons/css/flag-icons.min.css';

const LANGS = [
  { code: 'de', label: 'de' },
  { code: 'en', label: 'gb' },
  { code: 'fr', label: 'fr' }
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try { localStorage.setItem('i18nextLng', lng); } catch (e) {}
  };

  const currentLang = i18n.resolvedLanguage || i18n.language;

  return (
    <div className="language-switcher" role="navigation" aria-label="Language selector">
      {LANGS.map(l => {
        const isActive = currentLang === l.code || currentLang?.startsWith(l.code);
        return (
          <button
            key={l.code}
            className={`lang-btn ${isActive ? 'active' : ''}`}
            onClick={() => changeLanguage(l.code)}
            aria-pressed={isActive}
          >
            <span className={`fi fi-${l.label}`} />
          </button>
        );
      })}
    </div>
  );
}
