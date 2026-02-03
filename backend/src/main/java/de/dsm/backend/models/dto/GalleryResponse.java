package de.dsm.backend.models.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record GalleryResponse(
    UUID id,
    String title,
    String description,
    String image,
    Boolean published,
    LocalDateTime createdAt
) {
}
