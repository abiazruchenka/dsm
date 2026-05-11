import { useTranslation } from 'react-i18next';
import './Footer.css';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="app-footer">
      <p className="footer-copyright">
        © 2026 <span className="footer-project">DSM</span>
      </p>
      <p className="footer-author">
        {t('footer.developedBy')} Anatol Biazruchanka
      </p>
    </footer>
  );
}
