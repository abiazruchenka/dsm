package de.dsm.backend.models.dto;

import java.util.Map;
import java.util.UUID;

public record CategoryResponse(
        UUID id,
        String code,
        Map<String, String> names,
        int sortOrder
) {
}
