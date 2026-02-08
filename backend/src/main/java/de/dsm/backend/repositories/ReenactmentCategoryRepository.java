package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.ReenactmentCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReenactmentCategoryRepository extends JpaRepository<ReenactmentCategory, UUID> {
    List<ReenactmentCategory> findAllByOrderBySortOrderAsc();
    Optional<ReenactmentCategory> findByCode(String code);
}
