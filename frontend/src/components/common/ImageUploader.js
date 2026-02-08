import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../config/axios';
import './ImageUploader.css';

const ImageUploader = ({
  onUploadSuccess,
  galleryId = null,
  maxSizeMB = 3,
  showCaption = true,
  showAltText = true,
  uploadEndpoint = '/api/photos/upload'
}) => {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [caption, setCaption] = useState('');
  const [altText, setAltText] = useState('');

  const onFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const validFiles = [];
    const newPreviews = [];

    for (const file of selectedFiles) {
      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`${file.name}: ${t('gallery.upload.fileTooLarge')}`);
        continue;
      }

      if (!file.type.startsWith('image/')) {
        setError(`${file.name}: ${t('gallery.upload.invalidFileType')}`);
        continue;
      }

      validFiles.push(file);
      newPreviews.push({
        file,
        url: URL.createObjectURL(file),
        name: file.name
      });
    }

    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
      setError(null);
      setSuccess(false);
    }
  };

  const uploadImage = async () => {
    if (files.length === 0) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload photos');
      setLoading(false);
      return;
    }

    try {
      const uploadPromises = files.map(file => {
        const formData = new FormData();
        formData.append('file', file);
        if (caption) formData.append('caption', caption);
        if (altText) formData.append('altText', altText);
        if (galleryId) formData.append('galleryId', galleryId);
        
        return api.post(uploadEndpoint, formData);
      });

      const responses = await Promise.all(uploadPromises);
      
      setSuccess(true);
      setFiles([]);
      setPreviews([]);
      setCaption('');
      setAltText('');

      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';

      if (onUploadSuccess) {
        responses.forEach(response => {
          if (onUploadSuccess) {
            onUploadSuccess(response.data);
          }
        });
      }

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

  const removeFile = (index) => {
    const previewToRemove = previews[index];
    if (previewToRemove && previewToRemove.url) {
      URL.revokeObjectURL(previewToRemove.url);
    }
    
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    previews.forEach(preview => {
      if (preview.url) {
        URL.revokeObjectURL(preview.url);
      }
    });
    setFiles([]);
    setPreviews([]);
    setError(null);
  };

  return (
    <div className="image-uploader">
      <div className="image-uploader-body">
        <h3>{t('gallery.upload.title')}</h3>

        {error && (
          <div className="upload-error">{error}</div>
        )}

        {success && (
          <div className="upload-success">{t('gallery.upload.success')}</div>
        )}

        <div className="form-group">
          <label htmlFor="file-input" className="visually-hidden">{t('gallery.upload.selectFile')}</label>
          <input
            id="file-input"
            type="file"
            onChange={onFileChange}
            accept="image/*"
            multiple
            disabled={loading}
            aria-label={t('gallery.upload.selectFile')}
          />
        </div>

        {previews.length > 0 && (
          <div className="upload-previews">
            {previews.map((preview, index) => (
              <div key={index} className="upload-preview">
                <img src={preview.url} alt={preview.name || 'Preview'} />
                <button
                  onClick={() => removeFile(index)}
                  className="remove-preview-btn"
                  type="button"
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
            {previews.length > 0 && (
              <button
                onClick={clearAll}
                className="clear-all-btn"
                type="button"
                style={{ marginTop: '10px', padding: '4px 8px', height: '30px' }}
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {showCaption && (
          <div className="form-group">
            <label htmlFor="caption-input" className="visually-hidden">{t('gallery.upload.caption')}</label>
            <input
              id="caption-input"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder={t('gallery.upload.captionPlaceholder')}
              disabled={loading}
              aria-label={t('gallery.upload.caption')}
            />
          </div>
        )}

        {showAltText && (
          <div className="form-group">
            <label htmlFor="alt-text-input" className="visually-hidden">{t('gallery.upload.altText')}</label>
            <input
              id="alt-text-input"
              type="text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder={t('gallery.upload.altTextPlaceholder')}
              disabled={loading}
              aria-label={t('gallery.upload.altText')}
            />
          </div>
        )}

        <div className="form-actions">
          <button
            onClick={uploadImage}
            disabled={files.length === 0 || loading}
            className="upload-button"
          >
            {loading ? t('gallery.upload.uploading') : `${t('gallery.upload.upload')} ${files.length > 0 ? `(${files.length})` : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
