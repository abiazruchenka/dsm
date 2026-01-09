import logo from './logo.png';
import './Header.css';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';

export default function Header() {
  const { t } = useTranslation();

  const links = [
    {title: t('header.home'), link: '/startpage'},
    {title: t('header.events'), link: '/events'},
    {title: t('header.gallery'), link: '/gallery'},
    {title: t('header.reenactment'), link: '/reenactment'},
    {title: t('header.contact'), link: '/contact'}
  ];

  return (
    <header className="hero-header">
        <nav className="main-nav">
            <div className="logo">
                <img src={logo} alt="DSM Logo" height={80}/>
            </div>
            <ul className="nav-links">
                {links.map((item) => (
                    <li key={item.title}>
                        <Link className="App-link" to={item.link}>{item.title}</Link>
                    </li>
                ))}
            </ul>
            <LanguageSwitcher />
        </nav>
    </header>
  );
}
