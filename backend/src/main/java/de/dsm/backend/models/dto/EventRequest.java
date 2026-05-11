package de.dsm.backend.models.dto;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

public record EventRequest(
        UUID id,
        Map<String, String> titles,
        Map<String, String> texts,
        String image,
        String link,
        LocalDate date,
        Boolean published
) {
}
