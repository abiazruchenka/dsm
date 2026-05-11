import api from '../../config/axios';
import Divider from '../common/Divider';
import ImageUploader from '../common/ImageUploader';
import PhotoModal from '../common/PhotoModal';
import PhotoGrid from '../common/PhotoGrid';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalized } from '../../utils/i18n';
import { useLocale } from '../../hooks/useLocale';
import { usePhotoNavigation } from '../../hooks/usePhotoNavigation';
import { getOriginalPhotoUrl } from '../../utils/photoUtils';
import './Gallery.css';
import '../common/PublishedToggle.css';

export default function Album({ isAdmin }) {
    const { t } = useTranslation();
    const lang = useLocale();
    const navigate = useNavigate();
    const { galleryId } = useParams();
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

    useEffect(() => {
        if (galleryId) {
            fetchGallery(galleryId);
        }
    }, [galleryId]);

    useEffect(() => {
        if (selectedGallery?.id) {
            fetchPhotos(selectedGallery.id);
        }
    }, [selectedGallery]);

    usePhotoNavigation(selectedPhotoIndex, photos, () => setSelectedPhotoIndex(null), setSelectedPhotoIndex, (p) => p.filter(getOriginalPhotoUrl));

    const fetchGallery = async (id) => {
        try {
            setLoadingGallery(true);
            setError(null);
            try {
                const endpoint = isAdmin ? '/api/galleries/all' : '/api/galleries';
                const response = await api.get(endpoint);
                const gallery = response.data.find(g => String(g.id) === String(id));
                if (gallery) {
                    setSelectedGallery(gallery);
                } else {
                    setError(t('gallery.album.galleryNotFound'));
                }
            } catch (apiErr) {
                console.error('Error fetching galleries list:', apiErr);
                setError(t('gallery.album.loadFailed'));
            }
        } catch (err) {
            console.error('Error loading gallery:', err);
            setError(t('gallery.album.loadFailed'));
        } finally {
            setLoadingGallery(false);
        }
    };

    const fetchPhotos = async (galleryId) => {
        try {
          setLoadingPhotos(true);
          const response = await api.get(`/api/galleries/${galleryId}`);
          setPhotos(response.data || []);
        } catch (err) {
          console.error('Error loading photos:', err);
          setPhotos([]);
        } finally {
          setLoadingPhotos(false);
        }
      };

      const handlePhotoClick = (photo) => {
        const validPhotos = photos.filter(p => getOriginalPhotoUrl(p));
        const index = validPhotos.findIndex(p => p.id === photo.id);
        if (index >= 0) setSelectedPhotoIndex(index);
      };

      const handlePrevPhoto = (e) => {
        e.stopPropagation();
        if (selectedPhotoIndex > 0) setSelectedPhotoIndex(selectedPhotoIndex - 1);
      };

      const handleNextPhoto = (e) => {
        e.stopPropagation();
        const validPhotos = photos.filter(p => getOriginalPhotoUrl(p));
        if (selectedPhotoIndex < validPhotos.length - 1) setSelectedPhotoIndex(selectedPhotoIndex + 1);
      };

      const handleDeleteGallery = async (galleryId, e) => {
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        
        if (!window.confirm(t('gallery.album.deleteConfirm'))) {
          return;
        }
    
        try {
          await api.delete(`/api/galleries/${galleryId}`);
          if (selectedGallery?.id === galleryId) {
            setPhotos([]);
            navigate('/gallery');
          }
        } catch (err) {
          console.error('Error deleting gallery:', err);
          setError(t('gallery.album.deleteFailed'));
        }
      };

      const handleDeletePhoto = async (photoId, e) => {
        if (e) {
          e.stopPropagation();
        }
        
        if (!window.confirm(t('gallery.album.photoDeleteConfirm'))) {
          return;
        }
    
        try {
            await api.delete(`/api/photos/${photoId}`);
            if (selectedGallery?.id) {
                fetchPhotos(selectedGallery.id);
            }
        } catch (err) {
          console.error('Error deleting photo:', err);
          setError(t('gallery.album.photoDeleteFailed'));
        }
      };

      const handleSetMainPhoto = async (photo, e) => {
        if (e) {
          e.stopPropagation();
        }
    
        if (!selectedGallery) return;
    
        const imageKey = photo.versionKeys?.thumbnail || photo.objectKey;
        if (!imageKey) {
          setError('Photo does not have an image key');
          return;
        }
    
        try {
          await api.patch(`/api/galleries/${selectedGallery.id}`, {
            titles: selectedGallery.titles || {},
            descriptions: selectedGallery.descriptions || {},
            is_published: selectedGallery.published || false,
            image: imageKey
          });
    
          const updatedGalleries = await api.get(isAdmin ? '/api/galleries/all' : '/api/galleries');

          const updated = updatedGalleries.data.find(g => g.id === selectedGallery.id);
          if (updated) {
            setSelectedGallery(updated);
          }
        } catch (err) {
          console.error('Error setting main photo:', err);
          setError(t('gallery.album.setMainFailed'));
        }
      };

      const handleToggleGalleryPublished = async (published) => {
        if (!selectedGallery) return;
    
        try {
          await api.patch(`/api/galleries/${selectedGallery.id}`, {
            titles: selectedGallery.titles || {},
            descriptions: selectedGallery.descriptions || {},
            is_published: published,
            image: null
          });
           
          const updatedGalleries = await api.get(isAdmin ? '/api/galleries/all' : '/api/galleries');
          const updated = updatedGalleries.data.find(g => g.id === selectedGallery.id);
          if (updated) {
            setSelectedGallery(updated);
          }
        } catch (err) {
          console.error('Error updating gallery:', err);
          setError(t('gallery.album.updateStatusFailed'));
        }
      };

      const handleCloseModal = () => {
        setSelectedPhotoIndex(null);
      };

      const handlePhotoUploadSuccess = () => {
          if (selectedGallery?.id) {
              fetchPhotos(selectedGallery.id);
          }
      };

      if (loadingGallery) {
        return (
          <section className="gallery-container">
            <div className="gallery-inner">
              <Divider />
              <h2 className="gallery-title">Gallery</h2>
              <Divider />
              <div className="loading">{t('gallery.album.loadingGallery')}</div>
            </div>
          </section>
        );
      }

      if (!selectedGallery) {
        return (
          <section className="gallery-container">
            <div className="gallery-inner">
              <Divider />
              <h2 className="gallery-title">{t('gallery.title')}</h2>
              <Divider />
              <div className="error-message">{t('gallery.album.galleryNotFound')}</div>
            </div>
          </section>
        );
      }

      if (loadingPhotos) {
        return (
          <section className="gallery-container">
            <div className="gallery-inner">
              <Divider />
              <h2 className="gallery-title">{t('gallery.title')}</h2>
              <Divider />
              <div className="loading">{t('gallery.album.loadingPhotos')}</div>
            </div>
          </section>
        );
      }
    
      if (error) {
        return (
          <section className="gallery-container">
            <div className="gallery-inner">
              <Divider />
              <h2 className="gallery-title">Gallery</h2>
              <Divider />
              <div className="error-message">{error}</div>
            </div>
          </section>
        );
      }

    const validPhotos = photos.filter(getOriginalPhotoUrl);

    if (!selectedGallery) {
        return null; 
    }

    return (
        <main className="page-content">
            <section className="gallery-container">
                <div className="gallery-inner">
                    <h2 className="gallery-title">{getLocalized(selectedGallery?.titles, lang) || 'Gallery'}</h2>

               
                {(getLocalized(selectedGallery?.descriptions, lang)) && (
                <p className="page-summary">{getLocalized(selectedGallery?.descriptions, lang)}</p>
                )}

                {loadingPhotos ? (
                <div className="loading">{t('gallery.album.loadingPhotos')}</div>
                ) : photos.length === 0 ? (
                <div className="page-empty">{t('gallery.album.noPhotos')}</div>
                ) : (
                <PhotoGrid
                  photos={photos}
                  lang={lang}
                  isAdmin={isAdmin}
                  onPhotoClick={handlePhotoClick}
                  onSetMain={(photo) => handleSetMainPhoto(photo)}
                  onDelete={(photoId) => handleDeletePhoto(photoId)}
                  itemClassName="gallery-item"
                  overlayClassName="gallery-overlay"
                />
                )}


        
                <div className="gallery-back">
                    <button 
                        className="back-button" 
                        type="button"
                        onClick={() => {
                            navigate('/gallery');
                        }}
                    >
                        ← {t('gallery.album.backToGalleries')}
                    </button>
                </div>

            {isAdmin && selectedGallery && (
                <div className="gallery-upload-section">
                    <div className="gallery-admin-actions">
                        <label className="published-toggle">
                            <input
                            type="checkbox"
                            checked={selectedGallery.published || false}
                            onChange={(e) => handleToggleGalleryPublished(e.target.checked)}
                            />
                            {t('gallery.album.published')}
                        </label>
                        <button 
                            className="delete-gallery-button" 
                            onClick={() => handleDeleteGallery(selectedGallery.id)}
                            title={t('gallery.album.deleteGallery')}
                        >
                            🗑️ {t('gallery.album.deleteGallery')}
                        </button>
                    </div>
            
                    <ImageUploader
                    galleryId={selectedGallery.id}
                    onUploadSuccess={handlePhotoUploadSuccess}
                    maxSizeMB={3}
                    />
                </div>
                )}

            {selectedPhotoIndex != null && (
              <PhotoModal
                photos={validPhotos}
                selectedIndex={selectedPhotoIndex}
                lang={lang}
                onClose={handleCloseModal}
                onPrev={handlePrevPhoto}
                onNext={handleNextPhoto}
              />
            )}
            </div>
            </section>
        </main>
    );
}
