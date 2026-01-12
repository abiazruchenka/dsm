package de.dsm.backend.controllers;

import de.dsm.backend.models.dto.ContactRequest;
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


@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
@Validated
@Tag(name = "Contact", description = "Contact form operations")
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    @ResponseStatus(HttpStatus.OK)
    public void createContact(@Valid @RequestBody ContactRequest contactRequest) {
        contactService.createContact(contactRequest);
    }
}
