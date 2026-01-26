import './Gallery.css';
import Divider from '../common/Divider';
import AdminGalleryManagement from '../Admin/GalleryManagement';

export default function Gallery({ isAdmin }) {  
  const baseUrl = process.env.DSM_S3_ENDPOINT + '/' + process.env.DSM_S3_BUCKET + '/';

  const images = [
    { id: 1, link: baseUrl + 'gallery1.jpg', description: 'Medieval Festival 2022' },
    { id: 2, link: baseUrl + 'gallery2.jpg', description: 'Historical Reenactment' }]

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
      {isAdmin && <AdminGalleryManagement />}
    </section>
  );
}