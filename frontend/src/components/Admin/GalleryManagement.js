import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import ImageUploader from '../common/ImageUploader';
import './GalleryManagement.css';

const GalleryManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryDescription, setGalleryDescription] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [galleryId, setGalleryId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const createGallery = async () => {
    if (!galleryTitle.trim()) {
      setError(t('gallery.create.titleRequired'));
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await api.post('/api/galleries', {
        title: galleryTitle,
        description: galleryDescription,
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
        title: galleryTitle,
        description: galleryDescription,
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
        <div className="form-group">
          <label htmlFor="gallery-title-input">{t('gallery.create.titleLabel')}</label>
          <input
            id="gallery-title-input"
            type="text"
            value={galleryTitle}
            onChange={(e) => setGalleryTitle(e.target.value)}
            placeholder={t('gallery.create.titlePlaceholder')}
            disabled={loading || !!galleryId}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gallery-description-input">{t('gallery.create.descriptionLabel')}</label>
          <textarea
            id="gallery-description-input"
            value={galleryDescription}
            onChange={(e) => setGalleryDescription(e.target.value)}
            placeholder={t('gallery.create.descriptionPlaceholder')}
            disabled={loading || !!galleryId}
            rows={4}
          />
        </div>

        {galleryId && (
          <div className="form-group">
            <label>
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
          <button
            onClick={createGallery}
            disabled={!galleryTitle.trim() || loading}
            className="upload-button"
          >
            {loading ? t('gallery.create.creating') : t('gallery.create.create')}
          </button>
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
