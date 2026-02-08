package de.dsm.backend.services;

import de.dsm.backend.models.dto.EventRequest;
import de.dsm.backend.models.dto.EventResponse;
import de.dsm.backend.models.dto.PhotoResponse;
import de.dsm.backend.models.entity.Event;
import de.dsm.backend.repositories.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private S3UrlService s3UrlService;

    @Mock
    private EventRepository eventRepository;

    @Mock
    private PhotoService photoService;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private EventService eventService;

    private UUID eventId;
    private Event event;
    private EventRequest eventRequest;

    @BeforeEach
    void setUp() {
        eventId = UUID.randomUUID();
        event = new Event();
        ReflectionTestUtils.setField(event, "id", eventId);
        ReflectionTestUtils.setField(event, "title", "Test Event");
        ReflectionTestUtils.setField(event, "text", "Test Description");
        ReflectionTestUtils.setField(event, "createdAt", LocalDateTime.now());

        eventRequest = new EventRequest(eventId, "Test Event", "Test Description", null, null, null);
    }

    @Test
    void createEvent() {
        Event savedEvent = new Event();
        ReflectionTestUtils.setField(savedEvent, "id", eventId);
        ReflectionTestUtils.setField(savedEvent, "title", "Test Event");
        ReflectionTestUtils.setField(savedEvent, "text", "Test Description");
        ReflectionTestUtils.setField(savedEvent, "createdAt", LocalDateTime.now());

        when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);
        when(s3UrlService.getPublicUrl(null)).thenReturn(null);

        EventResponse result = eventService.createEvent(eventRequest);

        assertNotNull(result);
        assertEquals(eventId, result.id());
        assertEquals("Test Event", result.title());
        assertEquals("Test Description", result.text());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void createEventWithBlankTitle() {
        EventRequest invalidRequest = new EventRequest(null, "", "Test Description", null, null, null);

        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(invalidRequest);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEventWithBlankText() {
        EventRequest invalidRequest = new EventRequest(null, "Test Event", "", null, null, null);

        assertThrows(IllegalArgumentException.class, () -> {
            eventService.createEvent(invalidRequest);
        });

        verify(eventRepository, never()).save(any(Event.class));
    }

    @Test
    void createEventWithFile() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        PhotoResponse photoResponse = PhotoResponse.builder()
            .id(UUID.randomUUID())
            .objectKey("image-key")
            .build();
        when(photoService.uploadFile(any(), any(), any(), any())).thenReturn(photoResponse);

        Event savedEvent = new Event();
        ReflectionTestUtils.setField(savedEvent, "id", eventId);
        ReflectionTestUtils.setField(savedEvent, "title", "Test Event");
        ReflectionTestUtils.setField(savedEvent, "text", "Test Description");
        ReflectionTestUtils.setField(savedEvent, "image", "image-key");
        ReflectionTestUtils.setField(savedEvent, "createdAt", LocalDateTime.now());

        when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);
        when(s3UrlService.getPublicUrl("image-key")).thenReturn("https://example.com/image.jpg");

        EventResponse result = eventService.createEventWithFile(
            multipartFile, "Test Event", "Test Description", null, null
        );

        assertNotNull(result);
        assertEquals("Test Event", result.title());
        verify(photoService, times(1)).uploadFile(any(), any(), any(), any());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void getEvent() {
        when(eventRepository.getReferenceById(eventId)).thenReturn(event);
        when(s3UrlService.getPublicUrl(null)).thenReturn(null);

        EventResponse result = eventService.getEvent(eventId);

        assertNotNull(result);
        assertEquals(eventId, result.id());
        assertEquals("Test Event", result.title());
        verify(eventRepository, times(1)).getReferenceById(eventId);
    }

    @Test
    void getEvents() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<Event> eventPage = new PageImpl<>(List.of(event), pageable, 1);

        when(eventRepository.findAllOrderByDateDesc(pageable)).thenReturn(eventPage);
        when(s3UrlService.getPublicUrl(null)).thenReturn(null);

        Page<EventResponse> result = eventService.getEvents(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(eventRepository, times(1)).findAllOrderByDateDesc(pageable);
    }

    @Test
    void updateEvent() {
        EventRequest updateRequest = new EventRequest(
            eventId, "Updated Title", "Updated Text", "image-key", "https://example.com", LocalDate.now()
        );

        when(eventRepository.getReferenceById(eventId)).thenReturn(event);
        when(eventRepository.save(event)).thenReturn(event);
        when(s3UrlService.getPublicUrl("image-key")).thenReturn("https://example.com/image.jpg");

        EventResponse result = eventService.updateEvent(eventId, updateRequest);

        assertNotNull(result);
        assertEquals("Updated Title", event.getTitle());
        assertEquals("Updated Text", event.getText());
        assertNotNull(event.getUpdatedAt());
        verify(eventRepository, times(1)).getReferenceById(eventId);
        verify(eventRepository, times(1)).save(event);
    }

    @Test
    void updateEventWithFile() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        PhotoResponse photoResponse = PhotoResponse.builder()
            .id(UUID.randomUUID())
            .objectKey("new-image-key")
            .build();
        when(photoService.uploadFile(any(), any(), any(), any())).thenReturn(photoResponse);

        when(eventRepository.getReferenceById(eventId)).thenReturn(event);
        when(eventRepository.save(event)).thenReturn(event);
        when(s3UrlService.getPublicUrl("new-image-key")).thenReturn("https://example.com/new-image.jpg");

        EventResponse result = eventService.updateEventWithFile(
            eventId, multipartFile, "Updated Title", "Updated Text", null, null
        );

        assertNotNull(result);
        assertEquals("Updated Title", event.getTitle());
        assertEquals("new-image-key", event.getImage());
        verify(photoService, times(1)).uploadFile(any(), any(), any(), any());
        verify(eventRepository, times(1)).save(event);
    }

    @Test
    void deleteEvent() {
        doNothing().when(eventRepository).deleteById(eventId);

        eventService.deleteEvent(eventId);

        verify(eventRepository, times(1)).deleteById(eventId);
    }

    @Test
    void createEventWithFileWithDate() throws IOException {
        when(multipartFile.isEmpty()).thenReturn(false);
        PhotoResponse photoResponse = PhotoResponse.builder()
            .id(UUID.randomUUID())
            .objectKey("image-key")
            .build();
        when(photoService.uploadFile(any(), any(), any(), any())).thenReturn(photoResponse);

        Event savedEvent = new Event();
        ReflectionTestUtils.setField(savedEvent, "id", eventId);
        ReflectionTestUtils.setField(savedEvent, "title", "Test Event");
        ReflectionTestUtils.setField(savedEvent, "text", "Test Description");
        ReflectionTestUtils.setField(savedEvent, "image", "image-key");
        ReflectionTestUtils.setField(savedEvent, "date", LocalDate.of(2024, 1, 15));
        ReflectionTestUtils.setField(savedEvent, "createdAt", LocalDateTime.now());

        when(eventRepository.save(any(Event.class))).thenReturn(savedEvent);
        when(s3UrlService.getPublicUrl("image-key")).thenReturn("https://example.com/image.jpg");

        EventResponse result = eventService.createEventWithFile(
            multipartFile, "Test Event", "Test Description", null, "2024-01-15"
        );

        assertNotNull(result);
        assertEquals(LocalDate.of(2024, 1, 15), savedEvent.getDate());
    }
}
