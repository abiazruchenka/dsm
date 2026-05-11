import { getLocalized } from '../../utils/i18n';
import { getOriginalPhotoUrl } from '../../utils/photoUtils';

export default function PhotoModal({ photos, selectedIndex, lang, onClose, onPrev, onNext }) {
  const validPhotos = photos.filter(p => getOriginalPhotoUrl(p));
  const photo = validPhotos[selectedIndex];
  if (!photo || selectedIndex == null) return null;

  const url = getOriginalPhotoUrl(photo);
  const caption = getLocalized(photo?.captions, lang) || photo.altText || '';
  const hasPrev = selectedIndex > 0;
  const hasNext = selectedIndex < validPhotos.length - 1;

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="photo-modal-close" onClick={onClose} type="button" aria-label="Close">×</button>
        {hasPrev && (
          <button type="button" className="photo-modal-arrow photo-modal-prev" onClick={onPrev} aria-label="Previous photo">‹</button>
        )}
        <img src={url} alt={photo.altText || caption || 'Photo'} className="photo-modal-image" />
        {hasNext && (
          <button type="button" className="photo-modal-arrow photo-modal-next" onClick={onNext} aria-label="Next photo">›</button>
        )}
        {caption && <div className="photo-modal-caption">{caption}</div>}
      </div>
    </div>
  );
}
