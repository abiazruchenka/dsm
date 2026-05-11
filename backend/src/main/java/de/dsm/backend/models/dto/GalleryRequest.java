package de.dsm.backend.models.dto;

import jakarta.validation.constraints.NotNull;
import java.util.Map;

public record GalleryRequest(
        @NotNull Map<String, String> titles,
        Map<String, String> descriptions,
        boolean is_published,
        String image
) {
}
