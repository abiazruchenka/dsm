package de.dsm.backend.models.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        String title,
        String text,
        String image,
        String link,
        LocalDate date,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
