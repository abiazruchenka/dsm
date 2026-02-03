package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.Gallery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;

public interface GalleryRepository extends JpaRepository<Gallery, UUID> {
    @Query("SELECT g FROM Gallery g WHERE g.published = true ORDER BY g.createdAt DESC")
    List<Gallery> findByIs_publishedTrueOrderByCreatedAtDesc();
}
