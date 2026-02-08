import './Events.css';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../../config/axios';
import EventsManagement from './EventsManagement';

export default function Events({ isAdmin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchEvents();
  }, [page]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/api/events', {
        params: {
          page: page,
          size: 10,
          sort: 'date,desc'
        }
      });
      setEvents(response.data.content || []);
      setTotalPages(response.data.totalPages || 0);
      setTotalElements(response.data.totalElements || 0);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(t('events.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const truncateText = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <main className={`page-content simple-background`}>
      <section className="events-page">
        <div className="events-inner">
          <h2 className="events-title">{t('events.title')}</h2>
          <p className="page-summary">
            {t('events.description')}
          </p>
          
          {loading && <div className="loading">{t('events.loading')}</div>}
          {error && <div className="error-message">{error || t('events.loadFailed')}</div>}
          
          {!loading && !error && events.length === 0 && (
            <div className="page-empty">{t('events.noEvents')}</div>
          )}
          
          {!loading && !error && events.length > 0 && (
            <>
              <ul className="events-list">
                {events.map((ev) => (
                  <li 
                    className="event-item event-item-clickable"
                    key={ev.id}
                    onClick={() => handleEventClick(ev.id)}
                  >
                    {ev.image && (
                      <div className="event-image">
                        <img src={ev.image} alt={ev.title || 'Event'} loading="lazy" />
                      </div>
                    )}
                    <div className="event-content">
                      <h3 className="event-title">{ev.title}</h3>
                      {ev.date && (
                        <time className="event-date">{formatDate(ev.date)}</time>
                      )}
                    {ev.text && (
                      <p className="event-desc">{truncateText(ev.text, 150)}</p>
                    )}
                    </div>
                  </li>
                ))}
              </ul>

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
                    ← {t('events.previous')}
                  </button>
                  <span className="page-info">
                    {t('events.page')} {page + 1} {t('events.of')} {totalPages}
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
                    {t('events.next')} →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        {isAdmin && <EventsManagement onEventCreated={fetchEvents} />}
      </section>
    </main>
  );
}
