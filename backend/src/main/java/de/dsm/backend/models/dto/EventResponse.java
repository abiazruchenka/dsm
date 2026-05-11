package de.dsm.backend.models.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record EventResponse(
        UUID id,
        Map<String, String> titles,
        Map<String, String> texts,
        String image,
        String link,
        LocalDate date,
        Boolean published,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
