package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.Event;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface EventRepository extends JpaRepository<Event, UUID> {
    @Query("SELECT e FROM Event e ORDER BY e.date DESC NULLS LAST")
    Page<Event> findAllOrderByDateDesc(Pageable pageable);
}
