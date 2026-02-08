package de.dsm.backend.models.dto;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record BlocksByCategoryResponse(
        UUID id,
        String code,
        Map<String, String> names,
        int sortOrder,
        List<BlockListResponse> blocks
) {
}
