package de.dsm.backend.services;

import de.dsm.backend.models.dto.ContactRequest;
import de.dsm.backend.models.entity.Contact;
import de.dsm.backend.repositories.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;

    public void createContact(ContactRequest contactRequest) {
        Contact contact = new Contact(contactRequest.name(), contactRequest.email(), contactRequest.message());
        contactRepository.save(contact);
    }
}
