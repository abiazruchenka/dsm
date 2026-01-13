package de.dsm.backend.models.dto;

import de.dsm.backend.models.entity.Contact;

import java.time.LocalDateTime;
import java.util.UUID;

public record ContactResponse(
    UUID id,
    String name,
    String email,
    String message,
    LocalDateTime createdAt,
    boolean read,
    LocalDateTime readAt
) {
    public static ContactResponse fromEntity(Contact entity) {
        return new ContactResponse(
            entity.getId(),
            entity.getName(),
            entity.getEmail(),
            entity.getMessage(),
            entity.getCreatedAt(),
            entity.isRead(),
            entity.getReadAt()
        );
    }
}