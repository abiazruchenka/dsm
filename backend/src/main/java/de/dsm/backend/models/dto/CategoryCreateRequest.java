package de.dsm.backend.models.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryCreateRequest(
        @NotBlank String code,
        @NotBlank String nameDe,
        @NotBlank String nameEn,
        @NotBlank String nameFr,
        Integer sortOrder
) {
}
