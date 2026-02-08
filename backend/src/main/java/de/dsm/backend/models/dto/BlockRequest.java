package de.dsm.backend.models.dto;

import java.util.UUID;

public record BlockRequest(
        String title,
        String text,
        UUID categoryId,
        Integer sortOrder,
        String image
) {
}
