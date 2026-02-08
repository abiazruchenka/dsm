package de.dsm.backend.services;

import de.dsm.backend.models.dto.PhotoResponse;
import de.dsm.backend.models.entity.Photo;
import de.dsm.backend.repositories.PhotoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
class PhotoServiceTest {

    @Mock
    private S3UrlService s3UrlService;

    @Mock
    private S3Client s3Client;

    @Mock
    private PhotoRepository photoRepository;

    @Mock
    private MultipartFile multipartFile;

    @InjectMocks
    private PhotoService photoService;

    private UUID photoId;
    private UUID galleryId;
    private Photo photo;
    private String bucketName = "test-bucket";

    @BeforeEach
    void setUp() {
        photoId = UUID.randomUUID();
        galleryId = UUID.randomUUID();
        
        Map<String, String> versions = new HashMap<>();
        versions.put("original", "original/key.jpg");
        versions.put("thumbnail", "thumbs/key_thumb.jpg");

        photo = Photo.builder()
            .id(photoId)
            .objectKey("original/key.jpg")
            .bucket(bucketName)
            .originalName("test.jpg")
            .contentType("image/jpeg")
            .sizeBytes(1024L)
            .width(800)
            .height(600)
            .versions(versions)
            .galleryId(galleryId)
            .build();

        ReflectionTestUtils.setField(photoService, "bucketName", bucketName);
        ReflectionTestUtils.setField(photoService, "thumbSize", 300);
    }

    @Test
    void uploadFile() throws IOException {
        BufferedImage testImage = new BufferedImage(800, 600, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(testImage, "jpg", baos);
        byte[] imageBytes = baos.toByteArray();

        when(multipartFile.getBytes()).thenReturn(imageBytes);
        when(multipartFile.getOriginalFilename()).thenReturn("test.jpg");
        when(multipartFile.getContentType()).thenReturn("image/jpeg");
        when(multipartFile.getSize()).thenReturn((long) imageBytes.length);

        doReturn(PutObjectResponse.builder().build())
            .when(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));

        when(photoRepository.save(any(Photo.class))).thenAnswer(invocation -> {
            Photo photo = invocation.getArgument(0);
            ReflectionTestUtils.setField(photo, "id", photoId);
            return photo;
        });
        lenient().when(s3UrlService.getPublicUrl(anyString())).thenReturn("https://example.com/image.jpg");

        PhotoResponse result = photoService.uploadFile(multipartFile, "Test Caption", "Test Alt", galleryId);

        assertNotNull(result);
        assertEquals(photoId, result.getId());
        assertEquals("test.jpg", result.getOriginalName());
        assertEquals(galleryId, result.getGalleryId());
        verify(s3Client, atLeast(2)).putObject(any(PutObjectRequest.class), any(RequestBody.class));
        verify(photoRepository, times(1)).save(any(Photo.class));
    }

    @Test
    void uploadFileWithInvalidFormat() throws IOException {
        byte[] invalidBytes = "not an image".getBytes();

        when(multipartFile.getBytes()).thenReturn(invalidBytes);

        assertThrows(IllegalArgumentException.class, () -> {
            photoService.uploadFile(multipartFile, null, null, null);
        });

        verify(photoRepository, never()).save(any(Photo.class));
    }

    @Test
    void getPhotos() {
        Photo photo2 = Photo.builder()
            .id(UUID.randomUUID())
            .objectKey("original/key2.jpg")
            .bucket(bucketName)
            .originalName("test2.jpg")
            .contentType("image/jpeg")
            .galleryId(galleryId)
            .sortOrder(1)
            .build();

        when(photoRepository.findByGalleryIdOrderBySortOrderAsc(galleryId))
            .thenReturn(List.of(photo, photo2));
        when(s3UrlService.getPublicUrl(anyString())).thenReturn("https://example.com/image.jpg");

        List<PhotoResponse> result = photoService.getPhotos(galleryId);

        assertNotNull(result);
        assertEquals(2, result.size());
        verify(photoRepository, times(1)).findByGalleryIdOrderBySortOrderAsc(galleryId);
    }

    @Test
    void deletePhoto() {
        when(photoRepository.findById(photoId)).thenReturn(java.util.Optional.of(photo));
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(DeleteObjectResponse.builder().build());
        doNothing().when(photoRepository).deleteById(photoId);

        photoService.deletePhoto(photoId);

        verify(s3Client, atLeast(2)).deleteObject(any(DeleteObjectRequest.class));
        verify(photoRepository, times(1)).deleteById(photoId);
    }

    @Test
    void deletePhotoNotFound() {
        when(photoRepository.findById(photoId)).thenReturn(java.util.Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            photoService.deletePhoto(photoId);
        });

        verify(s3Client, never()).deleteObject(any(DeleteObjectRequest.class));
        verify(photoRepository, never()).deleteById(any());
    }

    @Test
    void deletePhotosByGalleryId() {
        Map<String, String> versions2 = new HashMap<>();
        versions2.put("original", "original/key2.jpg");
        versions2.put("thumbnail", "thumbs/key2_thumb.jpg");
        
        Photo photo2 = Photo.builder()
            .id(UUID.randomUUID())
            .objectKey("original/key2.jpg")
            .bucket(bucketName)
            .originalName("test2.jpg")
            .contentType("image/jpeg")
            .versions(versions2)
            .galleryId(galleryId)
            .build();

        when(photoRepository.findByGalleryIdOrderBySortOrderAsc(galleryId))
            .thenReturn(List.of(photo, photo2));
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(DeleteObjectResponse.builder().build());

        photoService.deletePhotosByGalleryId(galleryId);

        verify(s3Client, times(4)).deleteObject(any(DeleteObjectRequest.class));
        verify(photoRepository, times(1)).deleteAll(anyList());
    }

    @Test
    void deletePhotosByGalleryIdWithNoPhotos() {
        when(photoRepository.findByGalleryIdOrderBySortOrderAsc(galleryId))
            .thenReturn(List.of());

        photoService.deletePhotosByGalleryId(galleryId);

        verify(s3Client, never()).deleteObject(any(DeleteObjectRequest.class));
        verify(photoRepository, times(1)).deleteAll(anyList());
    }
}
