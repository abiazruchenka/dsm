package de.dsm.backend.models.dto;

import java.util.UUID;

public record BlockListResponse(
        UUID id,
        String title,
        String imageUrl,
        UUID categoryId,
        String categoryCode,
        int sortOrder
) {
}
