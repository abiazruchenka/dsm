import { useState, useEffect } from 'react';
import './Gallery.css';
import Divider from '../common/Divider';
import GalleryManagement from './GalleryManagement';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Gallery({ isAdmin }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGalleries();
  }, []);

  const fetchGalleries = async () => {
    try {
      setLoading(true);

      const endpoint = isAdmin ? '/api/galleries/all' : '/api/galleries';
      const response = await api.get(endpoint);
      setGalleries(response.data || []);
      setError(null);
    } catch (err) {
      console.error('Error loading galleries:', err);
      setError(t('gallery.list.loadFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="gallery-container">
        <div className="gallery-inner">
          <Divider />
          <h2 className="gallery-title">{t('gallery.title')}</h2>
          <Divider />
          <div className="loading">{t('gallery.list.loading')}</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="gallery-container">
        <div className="gallery-inner">
          <Divider />
          <h2 className="gallery-title">{t('gallery.title')}</h2>
          <Divider />
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <main className={`page-content simple-background`}>
      <section className="gallery-container">
        <div className="gallery-inner">
          <h2 className="gallery-title">{t('gallery.title')}</h2>

          {galleries.length === 0 ? (
            <div className="no-photos">{t('gallery.list.noGalleries')}</div>
          ) : (
            <div className="galleries-grid" role="list">
              {galleries.map((gallery) => (
                <div 
                  key={gallery.id} 
                  className={`gallery-card ${!gallery.published ? 'gallery-card-unpublished' : ''}`}
                  role="listitem"
                  onClick={() => navigate(`/gallery/${gallery.id}`)}
                >

                  {gallery.image ? (
                    <div className="gallery-card-image">
                      <img 
                        src={gallery.image} 
                        alt={gallery.title || 'Gallery'} 
                        loading="lazy"
                      />
                      <div className="gallery-card-overlay">
                        <span className="gallery-card-title">{gallery.title}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="gallery-card-placeholder">
                      <span className="gallery-card-title">{gallery.title}</span>
                    </div>
                  )}
                  {gallery.description && (
                    <p className="gallery-card-description">{gallery.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        {isAdmin && <GalleryManagement />}
      </section>
    </main>
  );
}
