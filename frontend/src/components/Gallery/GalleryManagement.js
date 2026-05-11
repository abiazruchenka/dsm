import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/axios';
import ImageUploader from '../common/ImageUploader';
import LocalizedFormFields from '../common/LocalizedFormFields';
import '../common/PublishedToggle.css';
import './GalleryManagement.css';

const GalleryManagement = () => {
  const { t } = useTranslation();
  const [titles, setTitles] = useState({ de: '', en: '', fr: '' });
  const [descriptions, setDescriptions] = useState({ de: '', en: '', fr: '' });
  const [isPublished, setIsPublished] = useState(false);
  const [galleryId, setGalleryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createGallery = async () => {
    if (!titles.de?.trim()) {
      setError(t('gallery.create.titleRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/api/galleries', {
        titles: { de: titles.de.trim(), en: titles.en.trim(), fr: titles.fr.trim() },
        descriptions: { de: descriptions.de.trim(), en: descriptions.en.trim(), fr: descriptions.fr.trim() },
        is_published: isPublished
      });

      setGalleryId(response.data.id);
      setSuccess(true);
      setError(null);

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
        err.message ||
        t('gallery.create.failed');
      setError(errorMessage);
      console.error('Gallery creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUploadSuccess = (photoResponse) => {
    console.log('Photo uploaded successfully:', photoResponse);
  };

  const handleTogglePublished = async (published) => {
    if (!galleryId) return;
    
    try {
      await api.patch(`/api/galleries/${galleryId}`, {
        titles: { de: titles.de.trim(), en: titles.en.trim(), fr: titles.fr.trim() },
        descriptions: { de: descriptions.de.trim(), en: descriptions.en.trim(), fr: descriptions.fr.trim() },
        is_published: published,
        image: null
      });
      setIsPublished(published);
    } catch (err) {
      console.error('Error updating gallery:', err);
      setError('Failed to update gallery status');
    }
  };

  return (
    <div className="gallery-management">
      <h2>{t('gallery.create.title')}</h2>

      <div className="gallery-form">
        <LocalizedFormFields
          value={titles}
          onChange={(key, val) => setTitles(prev => ({ ...prev, [key]: val }))}
          type="text"
          placeholderPrefix="Title"
          disabled={loading || !!galleryId}
          requiredDe
        />
        <LocalizedFormFields
          value={descriptions}
          onChange={(key, val) => setDescriptions(prev => ({ ...prev, [key]: val }))}
          type="textarea"
          placeholderPrefix="Description"
          textareaRows={3}
          disabled={loading || !!galleryId}
        />

        {galleryId && (
          <div className="form-group">
            <label className="published-toggle">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => handleTogglePublished(e.target.checked)}
                disabled={loading}
              />
              {t('gallery.create.published')}
            </label>
          </div>
        )}

        {error && (
          <div className="upload-error">{error}</div>
        )}

        {success && (
          <div className="upload-success">{t('gallery.create.success')}</div>
        )}

        {!galleryId ? (
          <div className="form-actions">
            <button
              onClick={createGallery}
              disabled={!titles.de?.trim() || loading}
              className="upload-button"
            >
              {loading ? t('gallery.create.creating') : t('gallery.create.create')}
            </button>
          </div>
        ) : (
          <div className="gallery-created">
            <p>{t('gallery.create.created')}</p>
            <ImageUploader
              galleryId={galleryId}
              onUploadSuccess={handlePhotoUploadSuccess}
              maxSizeMB={3}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryManagement;
