package de.dsm.backend.repositories;

import de.dsm.backend.models.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactRepository extends JpaRepository<Contact, Long> {
}
