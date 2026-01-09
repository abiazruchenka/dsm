import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './Contact.css';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const { t } = useTranslation();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
        ...prevState,
        [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');
    setError(false);

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (res.ok) {
            setStatus(t('contact.sent'));
            setError(false);
        }
        else {
            setStatus(t('contact.sendFailed'));
            setError(true);
        }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 
                      err.response?.data?.error || 
                      err.message || 
                      t('contact.sendFailed');
      setStatus(errorMsg);
      setError(true);
      console.error('Sending error:', err);
    } finally {
      setLoading(false);
    }
};

    return(
        <div className="contact-container">
          <div className="contact-card">
            <div className="contact-body">
              <h2 className="contact-title">{t('contact.title')}</h2>
              <p className="contact-description">
                {t('contact.description')}
              </p>

              {status && <div className={error ? "contact-error" : "contact-success"}>{status}</div>}

              <form className="contact-form" onSubmit={handleSubmit} autoComplete="on">
                <div className="form-grid">
                  <div className="form-row">
                    <label htmlFor="name" className="visually-hidden">{t('contact.name')}</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      placeholder={t('contact.name')}
                      aria-label={t('contact.name')}
                      value={formData.name}
                      onChange={handleChange}
                      required
                      autoComplete="name"
                    />
                  </div>

                  <div className="form-row">
                    <label htmlFor="email" className="visually-hidden">{t('contact.email')}</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder={t('contact.email')}
                      aria-label={t('contact.email')}
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label htmlFor="message" className="visually-hidden">{t('contact.message')}</label>
                  <textarea
                    id="message"
                    name="message"
                    rows="10"
                    placeholder={t('contact.message')}
                    aria-label={t('contact.message')}
                    value={formData.message}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                  ></textarea>
                </div>

                <div className="form-actions form-actions-right">
                  <button type="submit" className="btn primary" disabled={loading}>
                    {loading ? t('contact.sending') : t('contact.sendMessage')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
    )
}
