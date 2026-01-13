package de.dsm.backend.services;

import de.dsm.backend.models.dto.ContactRequest;
import de.dsm.backend.models.dto.ContactResponse;
import de.dsm.backend.models.entity.Contact;
import de.dsm.backend.models.mails.ContactMailData;
import de.dsm.backend.repositories.ContactRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.MailException;
import org.springframework.resilience.annotation.Retryable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactRepository contactRepository;
    private final EmailService emailService;

    public void createContact(ContactRequest contactRequest) {
        Contact contact = new Contact(contactRequest.name(), contactRequest.email(), contactRequest.message());
        contactRepository.save(contact);
        sendEmailAsync(contactRequest);
    }

    public Page<ContactResponse> getContacts(Pageable pageable) {
        var contacts = contactRepository.findAll(pageable);
        return contacts.map(ContactResponse::fromEntity);
    }

    public long readContactMessage(UUID id) {
        var contactObject = contactRepository.findById(id);
        if (contactObject.isPresent() && !contactObject.get().isRead()) {
            var contact = contactObject.get();
            contact.markAsRead();
            contactRepository.save(contact);
        }
        return getUnreadCount();
    }

    public void deleteContact(UUID id) {
        contactRepository.deleteById(id);
    }

    public long getUnreadCount() {
        return contactRepository.countByReadFalse();
    }

    @Async
    @Retryable(
            value = MailException.class,
            maxRetries = 3,
            delay = 5000
    )
    public void sendEmailAsync(ContactRequest contactRequest) {
        var contact = new ContactMailData(contactRequest.name(), contactRequest.email(), contactRequest.message());
        emailService.sendContactMessage(contact);
    }
}
