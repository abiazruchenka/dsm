package de.dsm.backend.models.dto;

import java.util.Map;
import java.util.UUID;

public record BlockResponse(
        UUID id,
        Map<String, String> titles,
        Map<String, String> texts,
        String imageUrl,
        UUID categoryId,
        String categoryCode,
        int sortOrder
) {
}
