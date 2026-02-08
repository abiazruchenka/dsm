import { useState, useEffect } from 'react';
import api from '../../config/axios';
import { useTranslation } from 'react-i18next';
import './ContactMessages.css';

export default function ContactMessages() {
  const { t } = useTranslation();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchContacts();
  }, [page]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/contact', {
        params: {
          page: page,
          size: 10,
          sort: 'createdAt,desc'
        }
      });
      setContacts(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
      setError('');
    } catch (err) {
      setError(t('contactMessages.loadFailed'));
      console.error('Error loading contacts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await api.patch(`/api/contact/${id}`);
      fetchContacts(); 

      window.dispatchEvent(new CustomEvent('contactRead'));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('contactMessages.deleteConfirm'))) {
      return;
    }
    try {
      await api.delete(`/api/contact/${id}`);
      fetchContacts(); 

      window.dispatchEvent(new CustomEvent('contactRead'));
    } catch (err) {
      console.error('Error deleting contact:', err);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <main className={`page-content page-background`}>
      <section className="contact-messages-container">
        <div className="contact-messages-inner">
        <h2 className="contact-messages-title">{t('contactMessages.title')}</h2>
        <p className="messages-summary">
          {t('contactMessages.totalMessages')}: {totalElements}
        </p>

        {loading && <div className="loading">{t('contactMessages.loading')}</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && contacts.length === 0 && (
          <div className="no-messages">{t('contactMessages.noMessages')}</div>
        )}

        {!loading && contacts.length > 0 && (
          <>
            <div className="messages-list">
              {contacts.map((contact) => (
                <div 
                  key={contact.id} 
                  className={`message-card ${!contact.read ? 'unread' : ''}`}
                  onClick={!contact.read ? () => handleRead(contact.id) : undefined}
                  style={!contact.read ? { cursor: 'pointer' } : undefined}
                >
                  <div className="message-header">
                    <div className="message-info">
                      <strong className="message-name">{contact.name}</strong>
                      <span className="message-email">{contact.email}</span>
                      <span className="message-date">{formatDate(contact.createdAt)}</span>
                    </div>
                    <div className="message-actions">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(contact.id);
                        }}
                        className="btn-delete"
                        title={t('contactMessages.delete')}
                      >
                        ×
                      </button>
                    </div>
                  </div>
                  <div className="message-content">
                    <p>{contact.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPage(p => Math.max(0, p - 1));
                  }}
                  disabled={page === 0}
                  className="upload-button"
                >
                  ← {t('contactMessages.previous')}
                </button>
                <span className="page-info">
                  {t('contactMessages.page')} {page + 1} {t('contactMessages.of')} {totalPages}
                </span>
                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPage(p => Math.min(totalPages - 1, p + 1));
                  }}
                  disabled={page >= totalPages - 1}
                  className="upload-button"
                >
                  {t('contactMessages.next')} →
                </button>
              </div>
            )}
          </>
        )}
        </div>
      </section>
    </main>
  );
}
