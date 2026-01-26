package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface GalleryRepository extends JpaRepository<Gallery, UUID> {
}
