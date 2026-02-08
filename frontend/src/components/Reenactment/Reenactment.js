import './Reenactment.css';
import { useTranslation } from 'react-i18next';
import Divider from '../common/Divider';

export default function Reenactment() {
  const { t } = useTranslation();

  return (
    <main className={`page-content simple-background`}>
      <section className="reenactment-page">
        <div className="reenactment-inner">
          <Divider className="brown" />
          <h2 className="reenactment-title">{t('reenactment.title') || 'Reenactment'}</h2>
          <Divider className="brown" />
          
          <div className="reenactment-content">
            <p className="reenactment-description">
              {t('reenactment.description') || 'Information about our reenactment activities and projects will be displayed here.'}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
