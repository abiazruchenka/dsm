import './Home.css';
import { useTranslation } from 'react-i18next';

export default function Home(){ 
    const { t } = useTranslation();

    return(
        <main className={`page-content home-background`}>
            <section className="hero-content">
                <div className="hero-accent-bar" aria-hidden="true" />
                <div className="hero-text-group">
                    <h1>{t("main.text")}</h1>
                    <p className="home-subtitle">
                        {t("main.subtext")}
                    </p>
                </div>
            </section>
        </main>
    );
}