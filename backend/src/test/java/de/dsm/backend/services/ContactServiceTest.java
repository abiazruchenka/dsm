package de.dsm.backend.services;

import de.dsm.backend.models.dto.ContactRequest;
import de.dsm.backend.models.dto.ContactResponse;
import de.dsm.backend.models.entity.Contact;
import de.dsm.backend.repositories.ContactRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContactServiceTest {

    @Mock
    private ContactRepository contactRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private ContactService contactService;

    private Contact contact;
    private ContactRequest contactRequest;
    private UUID contactId;

    @BeforeEach
    void setUp() {
        contactId = UUID.randomUUID();
        contact = new Contact("John Doe", "john@example.com", "Test message");
        ReflectionTestUtils.setField(contact, "id", contactId);
        ReflectionTestUtils.setField(contact, "createdAt", LocalDateTime.now());
        ReflectionTestUtils.setField(contact, "read", false);

        contactRequest = new ContactRequest("John Doe", "john@example.com", "Test message");
    }

    @Test
    void createContact() {
        Contact savedContact = new Contact(
            contactRequest.name(),
            contactRequest.email(),
            contactRequest.message()
        );
        ReflectionTestUtils.setField(savedContact, "id", contactId);

        when(contactRepository.save(any(Contact.class))).thenReturn(savedContact);
        doNothing().when(emailService).sendContactMessage(any());

        contactService.createContact(contactRequest);

        verify(contactRepository, times(1)).save(any(Contact.class));
        verify(emailService, times(1)).sendContactMessage(any());
    }

    @Test
    void getContacts() {
        Pageable pageable = PageRequest.of(0, 10);
        List<Contact> contacts = List.of(contact);
        Page<Contact> contactPage = new PageImpl<>(contacts, pageable, 1);

        when(contactRepository.findAll(pageable)).thenReturn(contactPage);

        Page<ContactResponse> result = contactService.getContacts(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals(contactId, result.getContent().get(0).id());
        assertEquals("John Doe", result.getContent().get(0).name());
        assertEquals("john@example.com", result.getContent().get(0).email());
        assertEquals("Test message", result.getContent().get(0).message());

        verify(contactRepository, times(1)).findAll(pageable);
    }

    @Test
    void readContactMessage() {
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));
        when(contactRepository.save(any(Contact.class))).thenReturn(contact);
        when(contactRepository.countByReadFalse()).thenReturn(5L);

        long unreadCount = contactService.readContactMessage(contactId);

        assertTrue(contact.isRead());
        assertNotNull(contact.getReadAt());
        assertEquals(5L, unreadCount);
        verify(contactRepository, times(1)).findById(contactId);
        verify(contactRepository, times(1)).save(contact);
        verify(contactRepository, times(1)).countByReadFalse();
    }

    @Test

    void readContactMessageAlreadyRead() {
        contact.markAsRead();
        LocalDateTime originalReadAt = contact.getReadAt();
        when(contactRepository.findById(contactId)).thenReturn(Optional.of(contact));
        when(contactRepository.countByReadFalse()).thenReturn(5L);

        long unreadCount = contactService.readContactMessage(contactId);

        assertTrue(contact.isRead());
        assertEquals(originalReadAt, contact.getReadAt());
        assertEquals(5L, unreadCount);
        verify(contactRepository, times(1)).findById(contactId);
        verify(contactRepository, never()).save(any(Contact.class));
        verify(contactRepository, times(1)).countByReadFalse();
    }

    @Test
    void whenContactNotFound() {
        when(contactRepository.findById(contactId)).thenReturn(Optional.empty());
        when(contactRepository.countByReadFalse()).thenReturn(10L);

        long unreadCount = contactService.readContactMessage(contactId);

        assertEquals(10L, unreadCount);
        verify(contactRepository, times(1)).findById(contactId);
        verify(contactRepository, never()).save(any(Contact.class));
        verify(contactRepository, times(1)).countByReadFalse();
    }

    @Test
    void deleteContact() {
        doNothing().when(contactRepository).deleteById(contactId);

        contactService.deleteContact(contactId);

        verify(contactRepository, times(1)).deleteById(contactId);
    }

    @Test
    void getUnreadCount() {
        long expectedCount = 7L;
        when(contactRepository.countByReadFalse()).thenReturn(expectedCount);

        long result = contactService.getUnreadCount();

        assertEquals(expectedCount, result);
        verify(contactRepository, times(1)).countByReadFalse();
    }

    @Test
    void whenNoUnreadContacts() {
        when(contactRepository.countByReadFalse()).thenReturn(0L);

        long result = contactService.getUnreadCount();

        assertEquals(0L, result);
        verify(contactRepository, times(1)).countByReadFalse();
    }

    @Test
    void noContacts() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Contact> emptyPage = new PageImpl<>(List.of(), pageable, 0);

        when(contactRepository.findAll(pageable)).thenReturn(emptyPage);

        Page<ContactResponse> result = contactService.getContacts(pageable);

        assertNotNull(result);
        assertEquals(0, result.getTotalElements());
        assertTrue(result.getContent().isEmpty());
        verify(contactRepository, times(1)).findAll(pageable);
    }
}
