import './Reenactment.css';
import '../Gallery/Gallery.css';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReenactmentManagement from './ReenactmentManagement';
import { reenactmentService } from '../../services/reenactmentService';
import { getLocalized } from '../../utils/i18n';
import { useLocale } from '../../hooks/useLocale';
import { usePhotoNavigation } from '../../hooks/usePhotoNavigation';
import { getOriginalPhotoUrl } from '../../utils/photoUtils';
import PhotoModal from '../common/PhotoModal';
import PhotoGrid from '../common/PhotoGrid';
import GalleryCard from '../common/GalleryCard';

export default function Reenactment({ isAdmin }) {
  const { t } = useTranslation();
  const { blockId } = useParams();
  const lang = useLocale();
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

  const photos = blockDetail?.photos || [];
  usePhotoNavigation(selectedPhotoIndex, photos, () => setSelectedPhotoIndex(null), setSelectedPhotoIndex, (p) => p.filter(getOriginalPhotoUrl));

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

  const handlePhotoClick = (photo) => {
    const photos = blockDetail?.photos?.filter(p => getOriginalPhotoUrl(p)) || [];
    const index = photos.findIndex(p => p.id === photo.id);
    if (index >= 0) setSelectedPhotoIndex(index);
  };

  const handleCloseModal = () => setSelectedPhotoIndex(null);

  const validPhotos = (blockDetail?.photos || []).filter(getOriginalPhotoUrl);
  const handlePrevPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex > 0) setSelectedPhotoIndex(selectedPhotoIndex - 1);
  };
  const handleNextPhoto = (e) => {
    e.stopPropagation();
    if (selectedPhotoIndex < validPhotos.length - 1) setSelectedPhotoIndex(selectedPhotoIndex + 1);
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
      <main className="page-content">
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
      <main className="page-content">
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
      <main className="page-content">
        <section className="reenactment-page">
          <div className="reenactment-inner">
            <h2 className="reenactment-detail-title">{getLocalized(blockDetail?.titles, lang) || ''}</h2>
            <div className="reenactment-content">
              {mainImageUrl && (
                <div className="reenactment-main-image">
                  <img src={mainImageUrl} alt={getLocalized(blockDetail?.titles, lang) || 'Block'} />
                </div>
              )}
              {(getLocalized(blockDetail?.texts, lang)) && (
                <p className="reenactment-block-item-text">{getLocalized(blockDetail?.texts, lang)}</p>
              )}
              {hasPhotos ? (
                <PhotoGrid
                  photos={blockDetail.photos}
                  lang={lang}
                  isAdmin={isAdmin}
                  onPhotoClick={handlePhotoClick}
                  onSetMain={handleSetMainPhoto}
                  onDelete={handleDeletePhoto}
                  itemClassName="reenactment-gallery-item"
                  overlayClassName="reenactment-gallery-item-overlay"
                  gridClassName="reenactment-gallery"
                />
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
      </main>
    );
  }

  const hasBlocks = groupedData.some((g) => g.blocks?.length > 0);

  return (
    <main className="page-content">
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
                      <GalleryCard
                        key={block.id}
                        imageUrl={block.imageUrl}
                        titles={block.titles}
                        lang={lang}
                        onClick={() => handleBlockClick(block.id)}
                        titleFallback={t('reenactment.untitled')}
                        extraClassName="reenactment-block-card"
                      />
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
