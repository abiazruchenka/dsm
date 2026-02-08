import api from '../../config/axios';
import Divider from '../common/Divider';
import ImageUploader from '../common/ImageUploader';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function Album({ isAdmin }) {
    const { t } = useTranslation();
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

    useEffect(() => {
        if (selectedPhotoIndex == null) return;
        const validPhotos = photos.filter(p => getOriginalPhotoUrl(p));
        const onKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedPhotoIndex(null);
            else if (e.key === 'ArrowLeft' && selectedPhotoIndex > 0) {
                setSelectedPhotoIndex(selectedPhotoIndex - 1);
                e.preventDefault();
            } else if (e.key === 'ArrowRight' && selectedPhotoIndex < validPhotos.length - 1) {
                setSelectedPhotoIndex(selectedPhotoIndex + 1);
                e.preventDefault();
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedPhotoIndex, photos]);

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

      const getPhotoUrl = (photo) => {
        if (!photo || !photo.versions) return null;
        return photo.versions.thumbnail || photo.versions.original || null;
      };
    
      const getOriginalPhotoUrl = (photo) => {
        if (!photo || !photo.versions) return null;
        return photo.versions.original || photo.versions.thumbnail || null;
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
            title: selectedGallery.title,
            description: selectedGallery.description,
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
            title: selectedGallery.title,
            description: selectedGallery.description,
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

      const PhotoModal = () => {
        const validPhotos = photos.filter(p => getOriginalPhotoUrl(p));
        const photo = validPhotos[selectedPhotoIndex];
        if (!photo || selectedPhotoIndex == null) return null;
        const url = getOriginalPhotoUrl(photo);
        const caption = photo.caption || photo.altText || '';
        const hasPrev = selectedPhotoIndex > 0;
        const hasNext = selectedPhotoIndex < validPhotos.length - 1;
        return (
          <div className="photo-modal-overlay" onClick={handleCloseModal}>
            <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="photo-modal-close" onClick={handleCloseModal}>×</button>
              {hasPrev && (
                <button type="button" className="photo-modal-arrow photo-modal-prev" onClick={handlePrevPhoto} aria-label="Previous photo">‹</button>
              )}
              <img src={url} alt={photo.altText || photo.caption || 'Photo'} className="photo-modal-image" />
              {hasNext && (
                <button type="button" className="photo-modal-arrow photo-modal-next" onClick={handleNextPhoto} aria-label="Next photo">›</button>
              )}
              {caption && <div className="photo-modal-caption">{caption}</div>}
            </div>
          </div>
        );
      };  

    if (!selectedGallery) {
        return null; 
    }

    return (
        <main className={`page-content simple-background`}>
            <section className="gallery-container">
                <div className="gallery-inner">
                    <h2 className="gallery-title">{selectedGallery?.title || 'Gallery'}</h2>

               
                {selectedGallery.description && (
                <p className="page-summary">{selectedGallery.description}</p>
                )}

                {loadingPhotos ? (
                <div className="loading">{t('gallery.album.loadingPhotos')}</div>
                ) : photos.length === 0 ? (
                <div className="page-empty">{t('gallery.album.noPhotos')}</div>
                ) : (
                <div className="galleries-grid" role="list">
                    {photos.map((photo) => {
                    const imageUrl = getPhotoUrl(photo);
                    if (!imageUrl) return null;

                    return (
                        <div 
                            className="gallery-item" 
                            role="listitem" 
                            key={photo.id}
                            onClick={() => handlePhotoClick(photo)}
                        >
                        {isAdmin && (
                            <div className="photo-admin-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                                className="photo-action-btn photo-main-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleSetMainPhoto(photo, e);
                                }}
                                title={t('gallery.album.setAsMain')}
                            >
                                ⭒
                            </button>
                            <button
                                className="photo-action-btn photo-delete-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeletePhoto(photo.id, e);
                                }}
                                title={t('gallery.album.deletePhoto')}
                            >
                                ×
                            </button>
                            </div>
                        )}
                        <img 
                            src={imageUrl} 
                            alt={photo.altText || photo.caption || 'Photo'} 
                            loading="lazy"
                            style={{ cursor: 'pointer' }}
                        />
                     {photo.caption && (
                        <div className="gallery-overlay">
                            <span className="gallery-zoom">
                            {photo.caption || 'Photo'}
                            </span>
                        </div>
                     )}
                    </div>
                    );      
                    })} 
                </div>
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
                        <label className="gallery-published-toggle">
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

            {selectedPhotoIndex != null && <PhotoModal />}
            </div>
            </section>
        </main>
    );
}
