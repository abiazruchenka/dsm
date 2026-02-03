import api from '../../config/axios';
import Divider from '../common/Divider';
import ImageUploader from '../common/ImageUploader';
import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Album({ isAdmin }) {
    const navigate = useNavigate();
    const { galleryId } = useParams();
    const [selectedGallery, setSelectedGallery] = useState(null);
    const [photos, setPhotos] = useState([]);
    const [loadingGallery, setLoadingGallery] = useState(true);
    const [loadingPhotos, setLoadingPhotos] = useState(false);
    const [error, setError] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

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
                    setError('Gallery not found');
                }
            } catch (apiErr) {
                console.error('Error fetching galleries list:', apiErr);
                setError('Failed to load gallery');
            }
        } catch (err) {
            console.error('Error loading gallery:', err);
            setError('Failed to load gallery');
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
        const originalUrl = getOriginalPhotoUrl(photo);
        if (originalUrl) {
          setSelectedPhoto({
            url: originalUrl,
            caption: photo.caption || photo.altText || '',
            alt: photo.altText || photo.caption || 'Photo'
          });
        }
      };

      const handleDeleteGallery = async (galleryId, e) => {
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        
        if (!window.confirm('Are you sure you want to delete this gallery? This action cannot be undone.')) {
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
          setError('Failed to delete gallery');
        }
      };

      const handleDeletePhoto = async (photoId, e) => {
        if (e) {
          e.stopPropagation();
        }
        
        if (!window.confirm('Are you sure you want to delete this photo?')) {
          return;
        }
    
        try {
            await api.delete(`/api/photos/${photoId}`);
            if (selectedGallery?.id) {
                fetchPhotos(selectedGallery.id);
            }
        } catch (err) {
          console.error('Error deleting photo:', err);
          setError('Failed to delete photo');
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
          setError('Failed to set main photo');
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
          setError('Failed to update gallery status');
        }
      };

      const handleCloseModal = () => {
        setSelectedPhoto(null);
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
              <div className="loading">Loading gallery...</div>
            </div>
          </section>
        );
      }

      if (!selectedGallery) {
        return (
          <section className="gallery-container">
            <div className="gallery-inner">
              <Divider />
              <h2 className="gallery-title">Gallery</h2>
              <Divider />
              <div className="error-message">Gallery not found</div>
            </div>
          </section>
        );
      }

      if (loadingPhotos) {
        return (
          <section className="gallery-container">
            <div className="gallery-inner">
              <Divider />
              <h2 className="gallery-title">Gallery</h2>
              <Divider />
              <div className="loading">Loading photos...</div>
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

      const PhotoModal = ({ photo, onClose }) => {
        if (!photo) return null;
    
        return (
          <div className="photo-modal-overlay" onClick={onClose}>
            <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="photo-modal-close" onClick={onClose}>×</button>
              <img src={photo.url} alt={photo.alt} className="photo-modal-image" />
              {photo.caption && (
                <div className="photo-modal-caption">{photo.caption}</div>
              )}
            </div>
          </div>
        );
      };  

    if (!selectedGallery) {
        return null; 
    }

    return (
        <section className="gallery-container">
        <div className="gallery-inner">
            <Divider />
            <div className="gallery-header">
            <button className="back-button" onClick={() => navigate('/gallery')}>
                ← Back to Galleries
            </button>
            <h2 className="gallery-title">{selectedGallery?.title || 'Gallery'}</h2>
            {isAdmin && (
                <div className="gallery-admin-actions">
                <label className="gallery-published-toggle">
                    <input
                    type="checkbox"
                    checked={selectedGallery.published || false}
                    onChange={(e) => handleToggleGalleryPublished(e.target.checked)}
                    />
                    Published
                </label>
                <button 
                    className="delete-gallery-button" 
                    onClick={() => handleDeleteGallery(selectedGallery.id)}
                    title="Delete Gallery"
                >
                    🗑️ Delete
                </button>
                </div>
            )}
            </div>
            {selectedGallery.description && (
            <p className="gallery-description">{selectedGallery.description}</p>
            )}
            <Divider />

            {isAdmin && selectedGallery && (
            <div className="gallery-upload-section">
                <ImageUploader
                galleryId={selectedGallery.id}
                onUploadSuccess={handlePhotoUploadSuccess}
                maxSizeMB={3}
                />
            </div>
            )}

            {loadingPhotos ? (
            <div className="loading">Loading photos...</div>
            ) : photos.length === 0 ? (
            <div className="no-photos">No photos available yet.</div>
            ) : (
            <div className="gallery-grid" role="list">
                {photos.map((photo) => {
                const imageUrl = getPhotoUrl(photo);
                if (!imageUrl) return null;

                return (
                    <div className="gallery-item" role="listitem" key={photo.id}>
                    {isAdmin && (
                        <div className="photo-admin-actions">
                        <button
                            className="photo-action-btn photo-main-btn"
                            onClick={(e) => handleSetMainPhoto(photo, e)}
                            title="Set as main"
                        >
                            ⭐
                        </button>
                        <button
                            className="photo-action-btn photo-delete-btn"
                            onClick={(e) => handleDeletePhoto(photo.id, e)}
                            title="Delete photo"
                        >
                            ×
                        </button>
                        </div>
                    )}
                    <img 
                        src={imageUrl} 
                        alt={photo.altText || photo.caption || 'Photo'} 
                        loading="lazy"
                        onClick={() => handlePhotoClick(photo)}
                        style={{ cursor: 'pointer' }}
                    />
                    <div className="gallery-overlay">
                        <span className="gallery-zoom">
                        {photo.caption || 'Photo'}
                        </span>
                    </div>
                    </div>
                );
                })}
            </div>
            )}
        </div>
        {selectedPhoto && (
            <PhotoModal photo={selectedPhoto} onClose={handleCloseModal} />
        )}
        </section>
    );
}
