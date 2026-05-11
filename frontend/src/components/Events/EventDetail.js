import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../config/axios';
import { getLocalized } from '../../utils/i18n';
import '../common/PublishedToggle.css';
import './EventDetail.css';

export default function EventDetail({ isAdmin }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = ['de', 'en', 'fr'].includes(i18n.language) ? i18n.language : 'en';
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [titleDe, setTitleDe] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [titleFr, setTitleFr] = useState('');
  const [textDe, setTextDe] = useState('');
  const [textEn, setTextEn] = useState('');
  const [textFr, setTextFr] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [published, setPublished] = useState(true);
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
      setTitleDe(eventData?.titles?.de || '');
      setTitleEn(eventData?.titles?.en || '');
      setTitleFr(eventData?.titles?.fr || '');
      setTextDe(eventData?.texts?.de || '');
      setTextEn(eventData?.texts?.en || '');
      setTextFr(eventData?.texts?.fr || '');
      setDate(eventData.date ? eventData.date.split('T')[0] : '');
      setLink(eventData.link || '');
      setPublished(eventData.published !== false);
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
      formData.append('title_de', titleDe);
      formData.append('title_en', titleEn);
      formData.append('title_fr', titleFr);
      formData.append('text_de', textDe);
      formData.append('text_en', textEn);
      formData.append('text_fr', textFr);
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
      formData.append('is_published', published);

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
      <main className={`page-content`}>
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
      <main className={`page-content`}>
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
    <main className={`page-content`}>
    <section className="event-detail-container">
        <div className="event-detail-inner">
            <h2 className="event-detail-title">{getLocalized(event?.titles, lang)}</h2>

       
        {event.date && (
        <time className="event-detail-date">{formatDate(event.date)}</time>
        )}

        <div className="event-detail-content">
          {event.image && (
            <div className="event-detail-image">
              <img src={event.image} alt={getLocalized(event?.titles, lang) || 'Event'} />
            </div>
          )}
          <div className="event-detail-text-wrapper">
            {(getLocalized(event?.texts, lang)) && (
              <div className="event-detail-text">{getLocalized(event?.texts, lang)}</div>
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
                <input type="text" value={titleDe} onChange={(e) => setTitleDe(e.target.value)} placeholder="Title (DE)" />
              </div>
              <div className="form-group">
                <input type="text" value={titleEn} onChange={(e) => setTitleEn(e.target.value)} placeholder="Title (EN)" />
              </div>
              <div className="form-group">
                <input type="text" value={titleFr} onChange={(e) => setTitleFr(e.target.value)} placeholder="Title (FR)" />
              </div>
              <div className="form-group">
                <textarea value={textDe} onChange={(e) => setTextDe(e.target.value)} placeholder="Text (DE)" rows={4} />
              </div>
              <div className="form-group">
                <textarea value={textEn} onChange={(e) => setTextEn(e.target.value)} placeholder="Text (EN)" rows={4} />
              </div>
              <div className="form-group">
                <textarea value={textFr} onChange={(e) => setTextFr(e.target.value)} placeholder="Text (FR)" rows={4} />
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

              <div className="form-group">
                <label className="published-toggle">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                  {t('events.create.published')}
                </label>
              </div>

              <div className="event-admin-actions">
                <button
                  onClick={handleSave}
                  disabled={saving || !titleDe.trim()}
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
