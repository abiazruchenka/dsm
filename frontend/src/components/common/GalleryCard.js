import { getLocalized } from '../../utils/i18n';

export default function GalleryCard({
  imageUrl,
  titles,
  descriptions,
  lang,
  onClick,
  titleFallback = '',
  extraClassName = '',
}) {
  const title = getLocalized(titles, lang) || titleFallback;
  const description = descriptions ? getLocalized(descriptions, lang) : '';

  return (
    <div
      className={`gallery-card ${extraClassName}`.trim()}
      role="listitem"
      onClick={onClick}
    >
      {imageUrl ? (
        <div className="gallery-card-image">
          <img src={imageUrl} alt={title} loading="lazy" />
          <div className="gallery-card-overlay">
            <span className="gallery-card-title">{title}</span>
          </div>
        </div>
      ) : (
        <div className="gallery-card-placeholder">
          <span className="gallery-card-title">{title}</span>
        </div>
      )}
      {description && (
        <p className="gallery-card-description">{description}</p>
      )}
    </div>
  );
}
