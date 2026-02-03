package de.dsm.backend.models.dto;

import jakarta.validation.constraints.NotBlank;

public record GalleryRequest(@NotBlank String title, String description, boolean is_published, String image) {
}
