package de.dsm.backend.models.dto;

import java.util.UUID;

public record BlockResponse(
        UUID id,
        String title,
        String text,
        String imageUrl,
        UUID categoryId,
        String categoryCode,
        int sortOrder
) {
}
