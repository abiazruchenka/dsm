import './Gallery.css';
import Divider from '../common/Divider';

export default function Gallery() {
  const baseUrl = process.env.DSM_S3_ENDPOINT + '/' + process.env.DSM_S3_BUCKET + '/';

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