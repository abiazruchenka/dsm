package de.dsm.backend.models.dto;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record GalleryResponse(
    UUID id,
    Map<String, String> titles,
    Map<String, String> descriptions,
    String image,
    Boolean published,
    LocalDateTime createdAt
) {
}
