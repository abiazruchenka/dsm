import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/axios';
import './EventDetail.css';

export default function EventDetail({ isAdmin }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [eventFile, setEventFile] = useState(null);
  const [eventFilePreview, setEventFilePreview] = useState(null);

  useEffect(() => {
    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/events/${eventId}`);
      const eventData = response.data;
      setEvent(eventData);
      setTitle(eventData.title || '');
      setText(eventData.text || '');
      setDate(eventData.date ? eventData.date.split('T')[0] : '');
      setLink(eventData.link || '');
    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!event) return;

    setSaving(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('text', text);
      if (eventFile) {
        formData.append('file', eventFile);
      }
      if (link.trim()) {
        formData.append('link', link.trim());
      } else {
        formData.append('link', '');
      }
      if (date) {
        formData.append('date', date);
      } else {
        formData.append('date', '');
      }

      await api.patch(`/api/events/${eventId}`, formData);

      // Clear file preview after save
      if (eventFilePreview) {
        URL.revokeObjectURL(eventFilePreview);
      }
      setEventFile(null);
      setEventFilePreview(null);

      await fetchEvent();
    } catch (err) {
      console.error('Error updating event:', err);
      setError(t('events.edit.failed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('events.edit.deleteConfirm'))) {
      return;
    }

    try {
      await api.delete(`/api/events/${eventId}`);
      navigate('/events');
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(t('events.edit.deleteFailed'));
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

  if (loading) {
    return (
      <main className={`page-content simple-background`}>
        <section className="event-detail-container">
          <div className="event-detail-inner">
            <div className="loading">Loading event...</div>
          </div>
        </section>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className={`page-content simple-background`}>
        <section className="event-detail-container">
          <div className="event-detail-inner">
            <div className="error-message">{error}</div>
          </div>
        </section>
      </main>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <main className={`page-content simple-background`}>
    <section className="event-detail-container">
        <div className="event-detail-inner">
            <h2 className="event-detail-title">{event.title}</h2>

       
        {event.date && (
        <time className="event-detail-date">{formatDate(event.date)}</time>
        )}

        <div className="event-detail-content">
          {event.image && (
            <div className="event-detail-image">
              <img src={event.image} alt={event.title || 'Event'} />
            </div>
          )}
          <div className="event-detail-text-wrapper">
            {event.text && (
              <div className="event-detail-text">{event.text}</div>
            )}
            {event.link && (
              <div className="event-detail-link">
                {event.link.startsWith('http://') || event.link.startsWith('https://') ? (
                  <a href={event.link} target="_blank" rel="noopener noreferrer">
                    {t('events.edit.viewGallery')}
                  </a>
                ) : (
                  <button
                    className="event-gallery-link-button"
                    onClick={() => navigate(event.link.startsWith('/') ? event.link : `/gallery/${event.link}`)}
                  >
                    {t('events.edit.viewGallery')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>


        {isAdmin && (
          <div className="event-detail-admin">
            <div className="event-admin-form">
              <h2 className="event-detail-title">{t('events.edit.title')}</h2>

              {error && (
                <div className="upload-error">{error}</div>
              )}

              <div className="form-group">
                <label htmlFor="event-title-input" className="visually-hidden">{t('events.create.eventTitle')}</label>
                <input
                  id="event-title-input"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={t('events.create.eventTitlePlaceholder')}
                  aria-label={t('events.create.eventTitle')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-text-input" className="visually-hidden">{t('events.create.eventDescription')}</label>
                <textarea
                  id="event-text-input"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t('events.create.eventDescriptionPlaceholder')}
                  rows={6}
                  aria-label={t('events.create.eventDescription')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-file-input" className="visually-hidden">{t('events.create.eventImage')}</label>
                <input
                  id="event-file-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setEventFile(file);
                      const previewUrl = URL.createObjectURL(file);
                      setEventFilePreview(previewUrl);
                    } else {
                      setEventFile(null);
                      if (eventFilePreview) {
                        URL.revokeObjectURL(eventFilePreview);
                      }
                      setEventFilePreview(null);
                    }
                  }}
                  aria-label={t('events.create.eventImage')}
                />
                {eventFilePreview && (
                  <div style={{ marginTop: '10px' }}>
                    <img 
                      src={eventFilePreview} 
                      alt={t('gallery.album.preview')} 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setEventFile(null);
                        if (eventFilePreview) {
                          URL.revokeObjectURL(eventFilePreview);
                        }
                        setEventFilePreview(null);
                        const fileInput = document.getElementById('event-file-input');
                        if (fileInput) fileInput.value = '';
                      }}
                      style={{ marginLeft: '10px', padding: '4px 8px' }}
                    >
                      {t('events.create.remove')}
                    </button>
                  </div>
                )}
                {!eventFilePreview && event.image && (
                  <div style={{ marginTop: '10px' }}>
                    <p style={{ marginBottom: '8px', fontSize: '14px', color: 'var(--color-off-white)' }}>{t('events.edit.currentImage')}</p>
                    <img 
                      src={event.image} 
                      alt={t('events.edit.currentImage')} 
                      style={{ maxWidth: '200px', maxHeight: '200px', borderRadius: '4px' }}
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="event-link-input" className="visually-hidden">{t('events.create.eventLink')}</label>
                <input
                  id="event-link-input"
                  type="text"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder={t('events.create.eventLinkPlaceholder')}
                  aria-label={t('events.create.eventLink')}
                />
              </div>

              <div className="form-group">
                <label htmlFor="event-date-input" className="visually-hidden">{t('events.create.eventDate')}</label>
                <input
                  id="event-date-input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  aria-label={t('events.create.eventDate')}
                />
              </div>

              <div className="event-admin-actions">
                <button
                  onClick={handleSave}
                  disabled={saving || !title.trim()}
                  className="save-button"
                >
                  {saving ? t('events.edit.saving') : t('events.edit.save')}
                </button>
                <button
                  onClick={handleDelete}
                  className="delete-button"
                >
                  {t('events.edit.delete')}
                </button>
              </div>
            </div>
          </div>)}
        

        <div className="event-detail-back">
          <button 
            className="back-button" 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate('/events');
            }}
          >
            ← {t('events.edit.backToEvents')}
          </button>
        </div>
      </div>
    </section>
    </main>
  );
}
