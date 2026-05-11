import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import '../common/PublishedToggle.css';
import './EventsManagement.css';

export default function EventsManagement({ onEventCreated }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [eventTitleDe, setEventTitleDe] = useState('');
  const [eventTitleEn, setEventTitleEn] = useState('');
  const [eventTitleFr, setEventTitleFr] = useState('');
  const [eventTextDe, setEventTextDe] = useState('');
  const [eventTextEn, setEventTextEn] = useState('');
  const [eventTextFr, setEventTextFr] = useState('');
  const [eventFile, setEventFile] = useState(null);
  const [eventFilePreview, setEventFilePreview] = useState(null);
  const [eventLink, setEventLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [isPublished, setIsPublished] = useState(true);
  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createEvent = async () => {
    if (!eventTitleDe.trim()) {
      setError(t('events.create.titleRequired'));
      return;
    }

    if (!eventTextDe.trim()) {
      setError(t('events.create.descriptionRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('title_de', eventTitleDe);
      formData.append('title_en', eventTitleEn);
      formData.append('title_fr', eventTitleFr);
      formData.append('text_de', eventTextDe);
      formData.append('text_en', eventTextEn);
      formData.append('text_fr', eventTextFr);
      if (eventFile) {
        formData.append('file', eventFile);
      }
      if (eventLink.trim()) {
        formData.append('link', eventLink.trim());
      }
      if (eventDate) {
        formData.append('date', eventDate);
      }
      formData.append('is_published', isPublished);

      const response = await api.post('/api/events', formData);

      setEventId(response.data.id);
      setSuccess(true);
      setError(null);

      setEventTitleDe('');
      setEventTitleEn('');
      setEventTitleFr('');
      setEventTextDe('');
      setEventTextEn('');
      setEventTextFr('');
      setEventFile(null);
      if (eventFilePreview) {
        URL.revokeObjectURL(eventFilePreview);
      }
      setEventFilePreview(null);
      setEventLink('');
      setEventDate('');

      if (onEventCreated) {
        onEventCreated();
      }

      navigate(`/events/${response.data.id}`);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        t('events.create.failed');
      setError(errorMessage);
      console.error('Event creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-management">
      <h2>{t('events.create.title')}</h2>

      <div className="events-form">
        <div className="form-group">
          <input type="text" value={eventTitleDe} onChange={(e) => setEventTitleDe(e.target.value)} placeholder="Title (DE)" disabled={loading || !!eventId} required />
        </div>
        <div className="form-group">
          <input type="text" value={eventTitleEn} onChange={(e) => setEventTitleEn(e.target.value)} placeholder="Title (EN)" disabled={loading || !!eventId} />
        </div>
        <div className="form-group">
          <input type="text" value={eventTitleFr} onChange={(e) => setEventTitleFr(e.target.value)} placeholder="Title (FR)" disabled={loading || !!eventId} />
        </div>
        <div className="form-group">
          <textarea value={eventTextDe} onChange={(e) => setEventTextDe(e.target.value)} placeholder="Description (DE)" disabled={loading || !!eventId} rows={4} required />
        </div>
        <div className="form-group">
          <textarea value={eventTextEn} onChange={(e) => setEventTextEn(e.target.value)} placeholder="Description (EN)" disabled={loading || !!eventId} rows={4} />
        </div>
        <div className="form-group">
          <textarea value={eventTextFr} onChange={(e) => setEventTextFr(e.target.value)} placeholder="Description (FR)" disabled={loading || !!eventId} rows={4} />
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
            disabled={loading || !!eventId}
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
        </div>

        <div className="form-group">
          <label htmlFor="event-link-input" className="visually-hidden">{t('events.create.eventLink')}</label>
          <input
            id="event-link-input"
            type="text"
            value={eventLink}
            onChange={(e) => setEventLink(e.target.value)}
            placeholder={t('events.create.eventLinkPlaceholder')}
            disabled={loading || !!eventId}
            aria-label={t('events.create.eventLink')}
          />
        </div>

        <div className="form-group">
          <label htmlFor="event-date-input" className="visually-hidden">{t('events.create.eventDate')}</label>
          <input
            id="event-date-input"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
            disabled={loading || !!eventId}
            aria-label={t('events.create.eventDate')}
          />
        </div>

        <div className="form-group">
          <label className="published-toggle">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              disabled={loading || !!eventId}
            />
            {t('events.create.published')}
          </label>
        </div>

        {error && (
          <div className="upload-error">{error}</div>
        )}

        {success && (
          <div className="upload-success">{t('events.create.success')}</div>
        )}

        {!eventId && (
          <div className="form-actions">
            <button
              onClick={createEvent}
              disabled={!eventTitleDe.trim() || !eventTextDe.trim() || loading}
              className="upload-button"
            >
              {loading ? t('events.create.creating') : t('events.create.create')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
