package de.dsm.backend.services;

import de.dsm.backend.models.dto.GalleryRequest;
import de.dsm.backend.models.dto.GalleryResponse;
import de.dsm.backend.models.entity.Gallery;
import de.dsm.backend.repositories.GalleryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GalleryServiceTest {

    @Mock
    private S3UrlService s3UrlService;

    @Mock
    private GalleryRepository galleryRepository;

    @Mock
    private PhotoService photoService;

    @InjectMocks
    private GalleryService galleryService;

    private UUID galleryId;
    private Gallery gallery;
    private GalleryRequest galleryRequest;

    @BeforeEach
    void setUp() {
        galleryId = UUID.randomUUID();
        gallery = new Gallery("Test Gallery", null, "Test Description", false);
        ReflectionTestUtils.setField(gallery, "id", galleryId);
        ReflectionTestUtils.setField(gallery, "createdAt", LocalDateTime.now());

        galleryRequest = new GalleryRequest("Test Gallery", "Test Description", false, null);
    }

    @Test
    void createGallery() {
        ArgumentCaptor<Gallery> galleryCaptor = ArgumentCaptor.forClass(Gallery.class);
        
        when(galleryRepository.save(any(Gallery.class))).thenAnswer(invocation -> {
            Gallery gallery = invocation.getArgument(0);
            ReflectionTestUtils.setField(gallery, "id", galleryId);
            ReflectionTestUtils.setField(gallery, "createdAt", LocalDateTime.now());
            return gallery;
        });
        when(s3UrlService.getPublicUrl(null)).thenReturn(null);

        GalleryResponse result = galleryService.createGallery(galleryRequest);

        assertNotNull(result);
        assertEquals(galleryId, result.id());
        assertEquals("Test Gallery", result.title());
        assertEquals("Test Description", result.description());
        assertFalse(result.published());
        
        verify(galleryRepository, times(1)).save(galleryCaptor.capture());
        Gallery savedGallery = galleryCaptor.getValue();
        assertEquals("Test Gallery", savedGallery.getTitle());
        assertEquals("Test Description", savedGallery.getDescription());
        assertFalse(savedGallery.getPublished());
    }

    @Test
    void updateGallery() {
        GalleryRequest updateRequest = new GalleryRequest("Updated Title", "Updated Description", true, "image-key");
        
        when(galleryRepository.getReferenceById(galleryId)).thenReturn(gallery);
        when(galleryRepository.save(gallery)).thenReturn(gallery);
        when(s3UrlService.getPublicUrl("image-key")).thenReturn("https://example.com/image.jpg");

        GalleryResponse result = galleryService.updateGallery(galleryId, updateRequest);

        assertNotNull(result);
        assertEquals("Updated Title", gallery.getTitle());
        assertEquals("Updated Description", gallery.getDescription());
        assertTrue(gallery.getPublished());
        assertEquals("image-key", gallery.getImage());
        verify(galleryRepository, times(1)).getReferenceById(galleryId);
        verify(galleryRepository, times(1)).save(gallery);
    }

    @Test
    void updateGalleryWithNullFields() {
        GalleryRequest updateRequest = new GalleryRequest(null, null, true, null);
        
        when(galleryRepository.getReferenceById(galleryId)).thenReturn(gallery);
        when(galleryRepository.save(gallery)).thenReturn(gallery);
        when(s3UrlService.getPublicUrl(null)).thenReturn(null);

        GalleryResponse result = galleryService.updateGallery(galleryId, updateRequest);

        assertNotNull(result);
        assertEquals("Test Gallery", gallery.getTitle());
        assertEquals("Test Description", gallery.getDescription());
        assertTrue(gallery.getPublished());
        verify(galleryRepository, times(1)).getReferenceById(galleryId);
        verify(galleryRepository, times(1)).save(gallery);
    }

    @Test
    void getGallery() {
        when(galleryRepository.getReferenceById(galleryId)).thenReturn(gallery);

        Gallery result = galleryService.getGallery(galleryId);

        assertNotNull(result);
        assertEquals(galleryId, result.getId());
        assertEquals("Test Gallery", result.getTitle());
        verify(galleryRepository, times(1)).getReferenceById(galleryId);
    }

    @Test
    void getAllPublishedGalleries() {
        Gallery publishedGallery = new Gallery("Published Gallery", null, "Description", true);
        ReflectionTestUtils.setField(publishedGallery, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(publishedGallery, "createdAt", LocalDateTime.now());

        when(galleryRepository.findByIs_publishedTrueOrderByCreatedAtDesc())
            .thenReturn(List.of(publishedGallery));
        when(s3UrlService.getPublicUrl(null)).thenReturn(null);

        List<GalleryResponse> result = galleryService.getAllPublishedGalleries();

        assertNotNull(result);
        assertEquals(1, result.size());
        assertTrue(result.get(0).published());
        verify(galleryRepository, times(1)).findByIs_publishedTrueOrderByCreatedAtDesc();
    }

    @Test
    void getAllGalleries() {
        Gallery gallery2 = new Gallery("Gallery 2", null, "Description 2", true);
        ReflectionTestUtils.setField(gallery2, "id", UUID.randomUUID());
        ReflectionTestUtils.setField(gallery2, "createdAt", LocalDateTime.now());

        when(galleryRepository.findAll()).thenReturn(List.of(gallery, gallery2));
        when(s3UrlService.getPublicUrl(null)).thenReturn(null);

        List<GalleryResponse> result = galleryService.getAllGalleries();

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(galleryRepository, times(1)).findAll();
    }

    @Test
    void deleteGallery() {
        doNothing().when(photoService).deletePhotosByGalleryId(galleryId);
        doNothing().when(galleryRepository).deleteById(galleryId);

        galleryService.deleteGallery(galleryId);

        verify(photoService, times(1)).deletePhotosByGalleryId(galleryId);
        verify(galleryRepository, times(1)).deleteById(galleryId);
    }

    @Test
    void deleteGalleryDeletesPhotosFirst() {
        doNothing().when(photoService).deletePhotosByGalleryId(galleryId);
        doNothing().when(galleryRepository).deleteById(galleryId);

        galleryService.deleteGallery(galleryId);

        var inOrder = inOrder(photoService, galleryRepository);
        inOrder.verify(photoService).deletePhotosByGalleryId(galleryId);
        inOrder.verify(galleryRepository).deleteById(galleryId);
    }
}
