package de.dsm.backend.models.dto;

import java.util.List;
import java.util.UUID;

public record BlockDetailResponse(
        UUID id,
        String title,
        String text,
        String imageUrl,
        UUID categoryId,
        String categoryCode,
        int sortOrder,
        List<PhotoResponse> photos
) {
}
