package de.dsm.backend.models.dto;

import java.util.Map;
import java.util.UUID;

public record BlockListResponse(
        UUID id,
        Map<String, String> titles,
        String imageUrl,
        UUID categoryId,
        String categoryCode,
        int sortOrder
) {
}
