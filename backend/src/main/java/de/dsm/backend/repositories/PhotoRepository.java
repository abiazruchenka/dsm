package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.Photo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PhotoRepository extends JpaRepository<Photo, UUID> {
    List<Photo> findByGalleryIdOrderBySortOrderAsc(UUID galleryId);
}
