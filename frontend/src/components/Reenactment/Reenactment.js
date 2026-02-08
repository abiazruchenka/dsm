import './Reenactment.css';
import '../Gallery/Gallery.css';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReenactmentManagement from './ReenactmentManagement';
import { reenactmentService } from '../../services/reenactmentService';

export default function Reenactment({ isAdmin }) {
  const { t, i18n } = useTranslation();
  const { blockId } = useParams();
  const lang = ['de', 'en', 'fr'].includes(i18n.language) ? i18n.language : 'en';
  const navigate = useNavigate();
  const [groupedData, setGroupedData] = useState([]);
  const [blockDetail, setBlockDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(null);

  useEffect(() => {
    fetchBlocks();
  }, []);

  useEffect(() => {
    if (blockId) {
      fetchBlockDetail(blockId);
    } else {
      setBlockDetail(null);
    }
  }, [blockId]);

  useEffect(() => {
    if (selectedPhotoIndex == null) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedPhotoIndex(null);
      } else if (e.key === 'ArrowLeft') {
        const photos = blockDetail?.photos?.filter(p => getOriginalPhotoUrl(p)) || [];
        if (selectedPhotoIndex > 0) setSelectedPhotoIndex(selectedPhotoIndex - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        const photos = blockDetail?.photos?.filter(p => getOriginalPhotoUrl(p)) || [];
        if (selectedPhotoIndex < photos.length - 1) setSelectedPhotoIndex(selectedPhotoIndex + 1);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedPhotoIndex, blockDetail]);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reenactmentService.getBlocksGroupedByCategory();
      setGroupedData(data || []);
    } catch (err) {
      console.error('Error loading reenactment blocks:', err);
      setError(t('reenactment.loadFailed') || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const fetchBlockDetail = async (id) => {
    try {
      setBlockDetail(null);
      setLoading(true);
      setError(null);
      const data = await reenactmentService.getBlockById(id);
      setBlockDetail(data);
    } catch (err) {
      console.error('Error loading block:', err);
      setError(t('reenactment.loadFailed') || 'Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (category) => {
    return category?.names?.[lang] || category?.names?.en || category?.code || '';
  };

  const getPhotoUrl = (photo) => {
    if (!photo?.versions) return null;
    return photo.versions.thumbnail || photo.versions.original || null;
  };

  const getOriginalPhotoUrl = (photo) => {
    if (!photo?.versions) return null;
    return photo.versions.original || photo.versions.thumbnail || null;
  };

  const handlePhotoClick = (photo) => {
    const photos = blockDetail?.photos?.filter(p => getOriginalPhotoUrl(p)) || [];
    const index = photos.findIndex(p => p.id === photo.id);
    if (index >= 0) setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => setSelectedPhotoIndex(null);

  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex > 0) setSelectedPhotoIndex(selectedPhotoIndex - 1);
  };

  const handleNextPhoto = (e) => {
    e.stopPropagation();
    const photos = blockDetail?.photos?.filter(p => getOriginalPhotoUrl(p)) || [];
    if (selectedPhotoIndex < photos.length - 1) setSelectedPhotoIndex(selectedPhotoIndex + 1);
  };

  const handleBlockClick = (id) => {
    navigate(`/reenactment/${id}`);
  };

  const handleBackToList = () => {
    navigate('/reenactment');
  };

  const handleSetMainPhoto = async (photo) => {
    if (!blockDetail) return;
    const imageKey = photo.versionKeys?.original || photo.versionKeys?.thumbnail || photo.objectKey;
    if (!imageKey) return;
    try {
      await reenactmentService.updateBlock(blockDetail.id, { image: imageKey });
      fetchBlockDetail(blockDetail.id);
    } catch (err) {
      console.error('Error setting main photo:', err);
      setError(t('gallery.album.setMainFailed'));
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm(t('gallery.album.photoDeleteConfirm'))) return;
    try {
      await reenactmentService.deletePhoto(photoId);
      fetchBlockDetail(blockDetail.id);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setError(t('gallery.album.photoDeleteFailed'));
    }
  };

  if (loading && !blockDetail) {
    return (
      <main className="page-content simple-background">
        <section className="reenactment-page">
          <div className="reenactment-inner">
            <h2 className="reenactment-title">{t('reenactment.title') || 'Reenactment'}</h2>
            <div className="loading">{t('reenactment.loading') || 'Loading...'}</div>
          </div>
        </section>
      </main>
    );
  }

  if (error && !blockDetail) {
    return (
      <main className="page-content simple-background">
        <section className="reenactment-page">
          <div className="reenactment-inner">
            <h2 className="reenactment-title">{t('reenactment.title') || 'Reenactment'}</h2>
            <div className="error-message">{error}</div>
          </div>
        </section>
      </main>
    );
  }

  if (blockId && blockDetail) {
    const hasPhotos = blockDetail.photos?.length > 0;
    const mainImageUrl = blockDetail.imageUrl;

    return (
      <main className="page-content simple-background">
        <section className="reenactment-page">
          <div className="reenactment-inner">
            <h2 className="reenactment-detail-title">{blockDetail.title || ''}</h2>
            <div className="reenactment-content">
              {mainImageUrl && (
                <div className="reenactment-main-image">
                  <img src={mainImageUrl} alt={blockDetail.title || 'Block'} />
                </div>
              )}
              {blockDetail.text && (
                <p className="reenactment-block-item-text">{blockDetail.text}</p>
              )}
              {hasPhotos ? (
                <div className="reenactment-gallery" role="list">
                  {blockDetail.photos.map((photo) => {
                    const url = getPhotoUrl(photo);
                    if (!url) return null;
                    return (
                      <div
                        key={photo.id}
                        className="reenactment-gallery-item"
                        role="listitem"
                        onClick={() => handlePhotoClick(photo)}
                      >
                        {isAdmin && (
                          <div className="photo-admin-actions" onClick={(e) => e.stopPropagation()}>
                            <button
                              className="photo-action-btn photo-main-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetMainPhoto(photo);
                              }}
                              title={t('gallery.album.setAsMain')}
                            >
                              ⭒
                            </button>
                            <button
                              className="photo-action-btn photo-delete-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePhoto(photo.id);
                              }}
                              title={t('gallery.album.deletePhoto')}
                            >
                              ×
                            </button>
                          </div>
                        )}
                        <img
                          src={url}
                          alt={photo.altText || photo.caption || 'Photo'}
                          loading="lazy"
                        />
                        {photo.caption && (
                          <div className="reenactment-gallery-item-overlay">
                            <span>{photo.caption || photo.altText || ''}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                !mainImageUrl && (
                  <div className="page-empty">{t('reenactment.noContent') || 'No photos yet.'}</div>
                )
              )}
            </div>
            <div className="reenactment-back">
                <button className="back-button" type="button" onClick={handleBackToList}>
                  ← {t('reenactment.backToList') || 'Back to list'}
                </button>
              </div>
            {isAdmin && (
              <ReenactmentManagement
                blockId={blockId}
                blockDetail={blockDetail}
                onRefresh={() => fetchBlockDetail(blockId)}
              />
            )}
          </div>
        </section>
        {selectedPhotoIndex != null && (() => {
          const photos = blockDetail.photos?.filter(p => getOriginalPhotoUrl(p)) || [];
          const photo = photos[selectedPhotoIndex];
          if (!photo) return null;
          const url = getOriginalPhotoUrl(photo);
          const caption = photo.caption || photo.altText || '';
          const hasPrev = selectedPhotoIndex > 0;
          const hasNext = selectedPhotoIndex < photos.length - 1;
          return (
            <div className="photo-modal-overlay" onClick={handleCloseModal}>
              <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="photo-modal-close" onClick={handleCloseModal}>×</button>
                {hasPrev && (
                  <button
                    type="button"
                    className="photo-modal-arrow photo-modal-prev"
                    onClick={handlePrevPhoto}
                    aria-label="Previous photo"
                  >
                    ‹
                  </button>
                )}
                <img src={url} alt={photo.altText || photo.caption || 'Photo'} className="photo-modal-image" />
                {hasNext && (
                  <button
                    type="button"
                    className="photo-modal-arrow photo-modal-next"
                    onClick={handleNextPhoto}
                    aria-label="Next photo"
                  >
                    ›
                  </button>
                )}
                {caption && <div className="photo-modal-caption">{caption}</div>}
              </div>
            </div>
          );
        })()}
      </main>
    );
  }

  const hasBlocks = groupedData.some((g) => g.blocks?.length > 0);

  return (
    <main className="page-content simple-background">
      <section className="reenactment-page">
        <div className="reenactment-inner">
          <h2 className="reenactment-title">{t('reenactment.title') || 'Reenactment'}</h2>

          {!hasBlocks ? (
            <div className="page-summary">
              {t('reenactment.description') || 'Information about our reenactment activities and projects will be displayed here.'}
            </div>
          ) : (
            groupedData.map((category) =>
              category.blocks?.length > 0 ? (
                <div key={category.code || 'other'} className="reenactment-category-section">
                  <h3 className="reenactment-category-title">{getCategoryName(category)}</h3>
                  <div className="galleries-grid" role="list">
                    {category.blocks.map((block) => (
                      <div
                        key={block.id}
                        className="reenactment-block-card gallery-card"
                        role="listitem"
                        onClick={() => handleBlockClick(block.id)}
                      >
                        {block.imageUrl ? (
                          <div className="gallery-card-image">
                            <img src={block.imageUrl} alt={block.title || 'Block'} loading="lazy" />
                            <div className="gallery-card-overlay">
                              <span className="gallery-card-title">{block.title || t('reenactment.untitled')}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="gallery-card-placeholder">
                            <span className="gallery-card-title">{block.title || t('reenactment.untitled')}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )
          )}
        </div>
        {isAdmin && (
          <ReenactmentManagement
            blockId={null}
            onRefresh={fetchBlocks}
          />
        )}
      </section>
    </main>
  );
}
