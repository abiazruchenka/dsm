import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import './EventsManagement.css';

export default function EventsManagement({ onEventCreated }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [eventTitle, setEventTitle] = useState('');
  const [eventText, setEventText] = useState('');
  const [eventFile, setEventFile] = useState(null);
  const [eventFilePreview, setEventFilePreview] = useState(null);
  const [eventLink, setEventLink] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventId, setEventId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createEvent = async () => {
    if (!eventTitle.trim()) {
      setError(t('events.create.titleRequired'));
      return;
    }

    if (!eventText.trim()) {
      setError(t('events.create.descriptionRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('title', eventTitle);
      formData.append('text', eventText);
      if (eventFile) {
        formData.append('file', eventFile);
      }
      if (eventLink.trim()) {
        formData.append('link', eventLink.trim());
      }
      if (eventDate) {
        formData.append('date', eventDate);
      }

      const response = await api.post('/api/events', formData);

      setEventId(response.data.id);
      setSuccess(true);
      setError(null);

      // Clear form
      setEventTitle('');
      setEventText('');
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
          <label htmlFor="event-title-input" className="visually-hidden">{t('events.create.eventTitle')}</label>
          <input
            id="event-title-input"
            type="text"
            value={eventTitle}
            onChange={(e) => setEventTitle(e.target.value)}
            placeholder={t('events.create.eventTitlePlaceholder')}
            disabled={loading || !!eventId}
            aria-label={t('events.create.eventTitle')}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="event-text-input" className="visually-hidden">{t('events.create.eventDescription')}</label>
          <textarea
            id="event-text-input"
            value={eventText}
            onChange={(e) => setEventText(e.target.value)}
            placeholder={t('events.create.eventDescriptionPlaceholder')}
            disabled={loading || !!eventId}
            rows={6}
            aria-label={t('events.create.eventDescription')}
            required
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
              disabled={!eventTitle.trim() || !eventText.trim() || loading}
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
