package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ContactRepository extends JpaRepository<Contact, UUID> {
    long countByReadFalse();
}
