package de.dsm.backend.controllers;

import de.dsm.backend.models.dto.ContactRequest;
import de.dsm.backend.models.dto.ContactResponse;
import de.dsm.backend.services.ContactService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;


@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Validated
@Tag(name = "Contact", description = "Contact form operations")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public void createContact(@Valid @RequestBody ContactRequest contactRequest) {
        contactService.createContact(contactRequest);
    }

    @GetMapping("/unread-count")
    public long getUnreadCount() {
        return contactService.getUnreadCount();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public void deleteContact(@PathVariable UUID id) {
        contactService.deleteContact(id);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public Page<ContactResponse> getContacts(Pageable pageable) {
        return contactService.getContacts(pageable);
    }

    @PatchMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public long readMessage(@PathVariable UUID id) {
        return contactService.readContactMessage(id);
    }

}
