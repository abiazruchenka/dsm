package de.dsm.backend.models.dto;

import java.util.Map;
import java.util.UUID;

public record BlockRequest(
        Map<String, String> titles,
        Map<String, String> texts,
        UUID categoryId,
        Integer sortOrder,
        String image
) {
}
