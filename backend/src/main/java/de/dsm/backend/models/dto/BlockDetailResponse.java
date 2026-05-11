package de.dsm.backend.models.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record BlockDetailResponse(
        UUID id,
        Map<String, String> titles,
        Map<String, String> texts,
        String imageUrl,
        UUID categoryId,
        String categoryCode,
        int sortOrder,
        List<PhotoResponse> photos
) {
}
