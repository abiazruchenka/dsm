import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import './Login.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(formData);
      navigate('/admin');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      t('login.loginFailed');
      setError(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <div className="login-body">
          <h2 className="login-title">{t('login.login')}</h2>

          {error && <div className="login-error">{error}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-row">
              <label htmlFor="email" className="visually-hidden">{t('login.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder={t('login.email')}
                aria-label={t('login.email')}
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-row">
              <label htmlFor="password" className="visually-hidden">{t('login.password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder={t('login.password')}
                aria-label={t('login.password')}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
              />
            </div>

            <div className="login-form-actions">
              <button type="submit" className="btn primary" disabled={loading}>
                {loading ? t('login.loggingIn') : t('login.login')}
              </button>
            </div>
          </form>

          <p className="login-register">
            {t('login.dontHaveAccount')}
          </p>
        </div>
      </div>
    </div>
  );
};

