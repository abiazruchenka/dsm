import './Gallery.css';
import Divider from '../common/Divider';
import { getGalleryImages } from '../../services/galleryData';

export default function Gallery() {
  const images = getGalleryImages();

  return (
    <section className="gallery-container">
      <div className="gallery-inner">
        <Divider />
        <h2 className="gallery-title">Gallery</h2>
        <Divider />

        <div className="gallery-grid" role="list">
          {images.map((src) => (
            <div className="gallery-item" role="listitem" key={src.id}>
              <img src={src.link} alt={`Gallery ${src.id}`} loading="lazy" />
              <div className="gallery-overlay">
                <span className="gallery-zoom">{src.description}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}