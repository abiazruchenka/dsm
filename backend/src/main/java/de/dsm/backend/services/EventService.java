package de.dsm.backend.services;

import de.dsm.backend.models.dto.EventRequest;
import de.dsm.backend.models.dto.EventResponse;
import de.dsm.backend.models.entity.Event;
import de.dsm.backend.repositories.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final S3UrlService s3UrlService;
    private final EventRepository eventRepository;
    private final PhotoService photoService;

    public EventResponse createEvent(EventRequest eventRequest){
        if (eventRequest.titles() == null || eventRequest.titles().isEmpty()) {
            throw new IllegalArgumentException("Event title is required");
        }
        String titleDe = eventRequest.titles().get("de");
        if (titleDe == null || titleDe.isBlank()) {
            throw new IllegalArgumentException("Event title (de) is required");
        }

        var event = new Event();
        updateRecord(event, eventRequest);
        if (eventRequest.published() != null) event.setPublished(eventRequest.published());
        return mapResponse(eventRepository.save(event));
    }

    public EventResponse createEventWithFile(MultipartFile file, String title, String titleDe, String titleEn,
            String titleFr, String text, String textDe, String textEn, String textFr, String link, String date, Boolean isPublished) {
        String tDe = (titleDe != null && !titleDe.isBlank()) ? titleDe : title;
        String tEn = (titleEn != null && !titleEn.isBlank()) ? titleEn : tDe;
        String tFr = (titleFr != null && !titleFr.isBlank()) ? titleFr : tDe;
        String txtDe = (textDe != null && !textDe.isBlank()) ? textDe : text;
        String txtEn = (textEn != null && !textEn.isBlank()) ? textEn : txtDe;
        String txtFr = (textFr != null && !textFr.isBlank()) ? textFr : txtDe;
        validateEventFields(tDe, txtDe);
        var event = new Event();
        setEventFieldsFromMultipart(event, file, tDe, tEn, tFr, txtDe, txtEn, txtFr, link, date);
        if (isPublished != null) event.setPublished(isPublished);
        return mapResponse(eventRepository.save(event));
    }

    public EventResponse getEvent(UUID id) {
        var event = eventRepository.getReferenceById(id);
        return mapResponse(event);
    }

    public Page<EventResponse> getEvents(Pageable pageable) {
        return eventRepository.findPublishedOrderByDateDesc(pageable).map(this::mapResponse);
    }

    public Page<EventResponse> getAllEvents(Pageable pageable) {
        return eventRepository.findAllOrderByDateDesc(pageable).map(this::mapResponse);
    }

    public EventResponse updateEvent(UUID id, EventRequest eventRequest) {
        Event event = eventRepository.getReferenceById(id);
        updateRecord(event, eventRequest);

        event.setUpdatedAt(LocalDateTime.now());
        return mapResponse(eventRepository.save(event));
    }

    public EventResponse updateEventWithFile(UUID id, MultipartFile file, String title, String titleDe, String titleEn,
            String titleFr, String text, String textDe, String textEn, String textFr, String link, String date, Boolean isPublished) {
        String tDe = (titleDe != null && !titleDe.isBlank()) ? titleDe : title;
        String tEn = (titleEn != null && !titleEn.isBlank()) ? titleEn : tDe;
        String tFr = (titleFr != null && !titleFr.isBlank()) ? titleFr : tDe;
        String txtDe = (textDe != null && !textDe.isBlank()) ? textDe : text;
        String txtEn = (textEn != null && !textEn.isBlank()) ? textEn : txtDe;
        String txtFr = (textFr != null && !textFr.isBlank()) ? textFr : txtDe;
        validateEventFields(tDe, txtDe);
        Event event = eventRepository.getReferenceById(id);
        setEventFieldsFromMultipart(event, file, tDe, tEn, tFr, txtDe, txtEn, txtFr, link, date);
        if (isPublished != null) event.setPublished(isPublished);
        event.setUpdatedAt(LocalDateTime.now());
        return mapResponse(eventRepository.save(event));
    }

    public void deleteEvent(UUID id){
        eventRepository.deleteById(id);
    }

    private void validateEventFields(String title, String text) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Event title (de) is required");
        }
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Event text (de) is required");
        }
    }

    private void setEventFieldsFromMultipart(Event event, MultipartFile file, String titleDe, String titleEn,
            String titleFr, String textDe, String textEn, String textFr, String link, String date) {
        event.setTitle(titleDe);
        event.setTitleFr(titleFr);
        event.setTitleEn(titleEn);
        event.setText(textDe);
        event.setTextFr(textFr);
        event.setTextEn(textEn);

        if (file != null && !file.isEmpty()) {
            try {
                var photoResponse = photoService.uploadFile(file, null, null, null, null, null);
                event.setImage(photoResponse.getObjectKey());
            } catch (IOException e) {
                throw new RuntimeException("Failed to upload image", e);
            }
        }

        if (link != null && !link.isBlank()) {
            event.setLink(link);
        } else {
            event.setLink(null);
        }

        if (date != null && !date.isBlank()) {
            try {
                event.setDate(LocalDate.parse(date));
            } catch (Exception e) {
          
            }
        } else {
            event.setDate(null);
        }
    }

    private void updateRecord(Event event, EventRequest eventRequest) {
        if (eventRequest.titles() != null) {
            String tDe = eventRequest.titles().get("de");
            event.setTitle(tDe);
            event.setTitleFr(eventRequest.titles().getOrDefault("fr", tDe != null ? tDe : ""));
            event.setTitleEn(eventRequest.titles().getOrDefault("en", tDe != null ? tDe : ""));
        }
        if (eventRequest.texts() != null) {
            String txtDe = eventRequest.texts().get("de");
            event.setText(txtDe);
            event.setTextFr(eventRequest.texts().getOrDefault("fr", txtDe != null ? txtDe : ""));
            event.setTextEn(eventRequest.texts().getOrDefault("en", txtDe != null ? txtDe : ""));
        }
        if (eventRequest.image() != null) event.setImage(eventRequest.image());
        if (eventRequest.link() != null) event.setLink(eventRequest.link());
        if (eventRequest.date() != null) event.setDate(eventRequest.date());
        if (eventRequest.published() != null) event.setPublished(eventRequest.published());
    }

    private EventResponse mapResponse(Event event) {
        Map<String, String> titles = new HashMap<>();
        if (event.getTitle() != null) titles.put("de", event.getTitle());
        if (event.getTitleFr() != null) titles.put("fr", event.getTitleFr());
        if (event.getTitleEn() != null) titles.put("en", event.getTitleEn());
        Map<String, String> texts = new HashMap<>();
        if (event.getText() != null) texts.put("de", event.getText());
        if (event.getTextFr() != null) texts.put("fr", event.getTextFr());
        if (event.getTextEn() != null) texts.put("en", event.getTextEn());
        return new EventResponse(
            event.getId(),
            titles,
            texts,
            s3UrlService.getPublicUrl(event.getImage()),
            event.getLink(),
            event.getDate(),
            event.isPublished(),
            event.getCreatedAt(),
            event.getUpdatedAt());
    }
}
