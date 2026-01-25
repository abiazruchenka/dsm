import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/axios';
import './GalleryManagement.css';

const GalleryManagement = () => {
  const { t } = useTranslation();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
 
    if (selectedFile.size > 20 * 1024 * 1024) {
      setError(t('gallery.upload.fileTooLarge'));
      return;
    }

    if (!selectedFile.type.startsWith('image/')) {
      setError(t('gallery.upload.invalidFileType'));
      return;
    }

    setFile(selectedFile);
    setError(null);
    setSuccess(false);
    
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
  };

  const uploadImage = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('caption', caption);
    formData.append('altText', altText);

    try {
      const response = await api.post('/api/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setSuccess(true);
      setFile(null);
      setPreview(null);
      setCaption('');
      setAltText('');
      
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          t('gallery.upload.failed');
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setFile(null);
    setError(null);
  };

  return (
    <div className="gallery-management">
      <h2>{t('gallery.upload.title')}</h2>
      
      <div className="upload-form">
        <div className="form-group">
          <label htmlFor="file-input">{t('gallery.upload.selectFile')}</label>
          <input 
            id="file-input"
            type="file" 
            onChange={onFileChange} 
            accept="image/*" 
            disabled={loading}
          />
        </div>

        {preview && (
          <div className="upload-preview">
            <img src={preview} alt="Preview" />
            <button 
              onClick={clearPreview}
              className="remove-preview-btn"
              type="button"
            >
              ×
            </button>
          </div>
        )}

        <div className="form-group">
          <label htmlFor="caption-input">{t('gallery.upload.caption')}</label>
          <input
            id="caption-input"
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t('gallery.upload.captionPlaceholder')}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="alt-text-input">{t('gallery.upload.altText')}</label>
          <input
            id="alt-text-input"
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder={t('gallery.upload.altTextPlaceholder')}
            disabled={loading}
          />
        </div>

        {error && (
          <div className="upload-error">{error}</div>
        )}

        {success && (
          <div className="upload-success">{t('gallery.upload.success')}</div>
        )}

        <button 
          onClick={uploadImage} 
          disabled={!file || loading}
          className="upload-button"
        >
          {loading ? t('gallery.upload.uploading') : t('gallery.upload.upload')}
        </button>
      </div>
    </div>
  );
};

export default GalleryManagement;
