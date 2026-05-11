import { useTranslation } from 'react-i18next';
import { getLocalized } from '../../utils/i18n';
import { getPhotoUrl } from '../../utils/photoUtils';

export default function PhotoGrid({
  photos,
  lang,
  isAdmin = false,
  onPhotoClick,
  onSetMain,
  onDelete,
  itemClassName = 'gallery-item',
  overlayClassName = 'gallery-overlay',
  gridClassName = 'galleries-grid',
}) {
  const { t } = useTranslation();

  return (
    <div className={gridClassName} role="list">
      {photos.map((photo) => {
        const url = getPhotoUrl(photo);
        if (!url) return null;
        const caption = getLocalized(photo?.captions, lang) || photo.altText;

        return (
          <div
            key={photo.id}
            className={itemClassName}
            role="listitem"
            onClick={() => onPhotoClick(photo)}
          >
            {isAdmin && (onSetMain || onDelete) && (
              <div className="photo-admin-actions" onClick={(e) => e.stopPropagation()}>
                {onSetMain && (
                  <button
                    type="button"
                    className="photo-action-btn photo-main-btn"
                    onClick={(e) => { e.stopPropagation(); onSetMain(photo); }}
                    title={t('gallery.album.setAsMain')}
                  >
                    ⭒
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="photo-action-btn photo-delete-btn"
                    onClick={(e) => { e.stopPropagation(); onDelete(photo.id); }}
                    title={t('gallery.album.deletePhoto')}
                  >
                    ×
                  </button>
                )}
              </div>
            )}
            <img
              src={url}
              alt={photo.altText || caption || 'Photo'}
              loading="lazy"
              style={{ cursor: 'pointer' }}
            />
            {caption && (
              <div className={overlayClassName}>
                <span className="gallery-zoom">{caption}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
