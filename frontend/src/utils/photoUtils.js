export function getPhotoUrl(photo) {
  if (!photo?.versions) return null;
  return photo.versions.thumbnail || photo.versions.original || null;
}

export function getOriginalPhotoUrl(photo) {
  if (!photo?.versions) return null;
  return photo.versions.original || photo.versions.thumbnail || null;
}
