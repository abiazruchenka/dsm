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
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EventService {

    private final S3UrlService s3UrlService;
    private final EventRepository eventRepository;
    private final PhotoService photoService;

    public EventResponse createEvent(EventRequest eventRequest){
        if (eventRequest.title() == null || eventRequest.title().isBlank()) {
            throw new IllegalArgumentException("Event title is required");
        }
        if (eventRequest.text() == null || eventRequest.text().isBlank()) {
            throw new IllegalArgumentException("Event text is required");
        }
        
        var event = new Event();
        updateRecord(event, eventRequest);
        return mapResponse(eventRepository.save(event));
    }

    public EventResponse createEventWithFile(MultipartFile file, String title, String text, String link, String date) {
        validateEventFields(title, text);
        var event = new Event();
        setEventFieldsFromMultipart(event, file, title, text, link, date);
        return mapResponse(eventRepository.save(event));
    }

    public EventResponse getEvent(UUID id) {
        var event = eventRepository.getReferenceById(id);
        return mapResponse(event);
    }

    public Page<EventResponse> getEvents(Pageable pageable) {
        return eventRepository.findAllOrderByDateDesc(pageable).map(this::mapResponse);
    }

    public EventResponse updateEvent(UUID id, EventRequest eventRequest) {
        Event event = eventRepository.getReferenceById(id);
        updateRecord(event, eventRequest);

        event.setUpdatedAt(LocalDateTime.now());
        return mapResponse(eventRepository.save(event));
    }

    public EventResponse updateEventWithFile(UUID id, MultipartFile file, String title, String text, String link, String date) {
        validateEventFields(title, text);
        Event event = eventRepository.getReferenceById(id);
        setEventFieldsFromMultipart(event, file, title, text, link, date);
        event.setUpdatedAt(LocalDateTime.now());
        return mapResponse(eventRepository.save(event));
    }

    public void deleteEvent(UUID id){
        eventRepository.deleteById(id);
    }

    private void validateEventFields(String title, String text) {
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("Event title is required");
        }
        if (text == null || text.isBlank()) {
            throw new IllegalArgumentException("Event text is required");
        }
    }

    private void setEventFieldsFromMultipart(Event event, MultipartFile file, String title, String text, String link, String date) {
        event.setTitle(title);
        event.setText(text);

        if (file != null && !file.isEmpty()) {
            try {
                var photoResponse = photoService.uploadFile(file, null, null, null);
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
        if (eventRequest.title() != null) event.setTitle(eventRequest.title());
        if (eventRequest.text() != null) event.setText(eventRequest.text());
        if (eventRequest.image() != null) event.setImage(eventRequest.image());
        if (eventRequest.link() != null) event.setLink(eventRequest.link());
        if (eventRequest.date() != null) event.setDate(eventRequest.date());
    }

    private EventResponse mapResponse(Event event) {
        return new EventResponse(
            event.getId(),
            event.getTitle(),
            event.getText(),
            s3UrlService.getPublicUrl(event.getImage()),
            event.getLink(),
            event.getDate(),
            event.getCreatedAt(),
            event.getUpdatedAt());
    }
}
