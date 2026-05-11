package de.dsm.backend.controllers;

import de.dsm.backend.models.dto.EventRequest;
import de.dsm.backend.models.dto.EventResponse;
import de.dsm.backend.services.EventService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
@Validated
@Tag(name = "Events", description = "Event management operations")
public class EventController {

    private final EventService eventService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEventWithFile(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "title_de", required = false) String titleDe,
            @RequestParam(value = "title_en", required = false) String titleEn,
            @RequestParam(value = "title_fr", required = false) String titleFr,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "text_de", required = false) String textDe,
            @RequestParam(value = "text_en", required = false) String textEn,
            @RequestParam(value = "text_fr", required = false) String textFr,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "is_published", required = false) Boolean isPublished
    ) {
        return eventService.createEventWithFile(file, title, titleDe, titleEn, titleFr, text, textDe, textEn, textFr, link, date, isPublished);
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public EventResponse createEvent(@Valid @RequestBody EventRequest request) {
        return eventService.createEvent(request);
    }

    @GetMapping
    public Page<EventResponse> getEvents(Pageable pageable) {
        return eventService.getEvents(pageable);
    }

    @GetMapping("/all")
    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return eventService.getAllEvents(pageable);
    }

    @GetMapping("/{id}")
    public EventResponse getEvent(@PathVariable UUID id) {
        return eventService.getEvent(id);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public EventResponse updateEventWithFile(
            @PathVariable UUID id,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "title_de", required = false) String titleDe,
            @RequestParam(value = "title_en", required = false) String titleEn,
            @RequestParam(value = "title_fr", required = false) String titleFr,
            @RequestParam(value = "text", required = false) String text,
            @RequestParam(value = "text_de", required = false) String textDe,
            @RequestParam(value = "text_en", required = false) String textEn,
            @RequestParam(value = "text_fr", required = false) String textFr,
            @RequestParam(value = "link", required = false) String link,
            @RequestParam(value = "date", required = false) String date,
            @RequestParam(value = "is_published", required = false) Boolean isPublished
    ) {
        return eventService.updateEventWithFile(id, file, title, titleDe, titleEn, titleFr, text, textDe, textEn, textFr, link, date, isPublished);
    }

    @PatchMapping(value = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public EventResponse updateEvent(@PathVariable UUID id, @Valid @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
    }
}
