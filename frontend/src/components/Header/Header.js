import { useState, useEffect, useCallback, useMemo } from 'react';
import logo from './logo.png';
import './Header.css';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../LanguageSwitcher/LanguageSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../config/axios';

export default function Header() {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await api.get('/api/contact/unread-count');
      const newCount = response.data || 0;
      setUnreadCount(prevCount => prevCount !== newCount ? newCount : prevCount);
    } catch (error) {
      setUnreadCount(0);
    }
  }, []); 

  useEffect(() => {
    if (isAdmin) {
      fetchUnreadCount();

      const interval = setInterval(fetchUnreadCount, 30000);
      
      const handleContactUpdate = () => {
        fetchUnreadCount();
      };
      window.addEventListener('contactRead', handleContactUpdate);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('contactRead', handleContactUpdate);
      };
    } else {
      setUnreadCount(0);
    }
  }, [isAdmin, fetchUnreadCount]);

  const links = useMemo(() => [
    {title: t('header.home'), link: '/startpage'},
    {title: t('header.events'), link: '/events'},
    {title: t('header.gallery'), link: '/gallery'},
    {title: t('header.reenactment'), link: '/reenactment'},
    {title: t('header.contact'), link: '/contact', showBadge: isAdmin}
  ], [t, isAdmin]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/');
  }, [logout, navigate]); 

  return (
    <header className="hero-header">
        <nav className="main-nav">
            <div className="logo">
                <img src={logo} alt="DSM Logo" height={80}/>
            </div>
            <ul className="nav-links">
                {links.map((item) => (
                    <li key={item.title} className="nav-link-item">
                        <Link className="App-link" to={item.link}>
                            {item.title}
                            {item.showBadge && unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
            <div className="header-actions">
              <LanguageSwitcher />
              {isAuthenticated && (
                <button 
                  className="logout-button" 
                  onClick={handleLogout}
                  title={t('login.logoutButton')}
                >
                  {t('login.logoutButton')}
                </button>
              )}
            </div>
        </nav>
    </header>
  );
}
