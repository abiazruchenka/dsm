import { useState, useEffect } from 'react';
import './Gallery.css';
import GalleryManagement from './GalleryManagement';
import GalleryCard from '../common/GalleryCard';
import api from '../../config/axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../../hooks/useLocale';

export default function Gallery({ isAdmin }) {
  const { t } = useTranslation();
  const lang = useLocale();
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
          <h2 className="gallery-title">{t('gallery.title')}</h2>
          <div className="loading">{t('gallery.list.loading')}</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="gallery-container">
        <div className="gallery-inner">
          <h2 className="gallery-title">{t('gallery.title')}</h2>
          <div className="error-message">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <main className="page-content">
      <section className="gallery-container">
        <div className="gallery-inner">
          <h2 className="gallery-title">{t('gallery.title')}</h2>
          <p className="page-summary">
            {t('gallery.description')}
          </p>
          {galleries.length === 0 ? (
            <div className="page-empty">{t('gallery.list.noGalleries')}</div>
          ) : (
            <div className="galleries-grid" role="list">
              {galleries.map((gallery) => (
                <GalleryCard
                  key={gallery.id}
                  imageUrl={gallery.image}
                  titles={gallery.titles}
                  descriptions={gallery.descriptions}
                  lang={lang}
                  onClick={() => navigate(`/gallery/${gallery.id}`)}
                  extraClassName={!gallery.published ? 'gallery-card-unpublished' : ''}
                />
              ))}
            </div>
          )}
        </div>
        {isAdmin && <GalleryManagement />}
      </section>
    </main>
  );
}
