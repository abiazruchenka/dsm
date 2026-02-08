package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.Block;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface BlockRepository extends JpaRepository<Block, UUID> {
    List<Block> findAllByOrderBySortOrderAsc();
    List<Block> findAllByCategoryIdOrderBySortOrderAsc(UUID categoryId);
    List<Block> findAllByCategoryIdIsNullOrderBySortOrderAsc();
}
