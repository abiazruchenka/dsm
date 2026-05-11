import { useEffect } from 'react';

export function usePhotoNavigation(selectedIndex, photos, onClose, setIndex, getValidPhotos) {
  useEffect(() => {
    if (selectedIndex == null) return;
    const validPhotos = getValidPhotos ? getValidPhotos(photos) : photos;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && selectedIndex > 0) {
        setIndex(selectedIndex - 1);
        e.preventDefault();
      } else if (e.key === 'ArrowRight' && selectedIndex < validPhotos.length - 1) {
        setIndex(selectedIndex + 1);
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedIndex, photos, onClose, setIndex, getValidPhotos]);
}
