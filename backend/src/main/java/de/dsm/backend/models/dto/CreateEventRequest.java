package de.dsm.backend.models.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateEventRequest(@NotBlank String title, @NotBlank String text) {
}
