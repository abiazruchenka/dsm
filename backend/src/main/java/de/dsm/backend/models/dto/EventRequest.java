package de.dsm.backend.models.dto;

import java.time.LocalDate;
import java.util.UUID;

public record EventRequest(
        UUID id,
        String title,
        String text,
        String image,
        String link,
        LocalDate date
) {
}
