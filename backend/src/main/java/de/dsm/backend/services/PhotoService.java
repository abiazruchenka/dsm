package de.dsm.backend.services;

import de.dsm.backend.models.dto.PhotoResponse;
import de.dsm.backend.models.entity.Photo;
import de.dsm.backend.repositories.PhotoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final S3UrlService s3UrlService;
    private final S3Client s3Client;
    private final PhotoRepository photoRepository;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Value("${admin.image.thumbsize}")
    private int thumbSize;

    public PhotoResponse uploadFile(MultipartFile file, String caption, String altText, UUID galleryId) throws IOException {

        byte[] fileBytes = file.getBytes();

        try (InputStream inputStream = new ByteArrayInputStream(fileBytes)) {
            var image = ImageIO.read(inputStream);

            if (image == null) {
                throw new IllegalArgumentException("Wrong image format");
            }

            String baseName = UUID.randomUUID().toString();
            String objectKey = "original/" + baseName + "_" + file.getOriginalFilename();
            String thumbKey = "thumbs/" + baseName + "_thumb.jpg";

            var width = image.getWidth();
            var height = image.getHeight();

            BufferedImage thumbImage = createThumbnail(image, thumbSize);

            uploadToS3(objectKey, fileBytes, file.getContentType());

            var thumbOs = new ByteArrayOutputStream();
            if (!ImageIO.write(thumbImage, "jpg", thumbOs)) {
                throw new IllegalStateException("JPEG writer not found");
            }
            byte[] thumbBytes = thumbOs.toByteArray();
            uploadToS3(thumbKey, thumbBytes, "image/jpeg");

            Map<String, String> versions = new HashMap<>();

            versions.put("original", objectKey);
            versions.put("thumbnail", thumbKey);

            var photoBuilder = Photo.builder()
                    .objectKey(objectKey)
                    .bucket(bucketName)
                    .originalName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .sizeBytes(file.getSize())
                    .width(width)
                    .height(height)
                    .versions(versions)
                    .caption(caption != null && !caption.isEmpty() ? caption : null)
                    .altText(altText != null && !altText.isEmpty() ? altText : null);

            if (galleryId != null) {
                photoBuilder.galleryId(galleryId);
            }

            var photo = photoBuilder.build();
            var photoResult = photoRepository.save(photo);
            return mapToPhotoResponse(photoResult);
        }
    }

    public List<PhotoResponse> getPhotos(UUID id) {
        List<Photo> photos = photoRepository.findByGalleryIdOrderBySortOrderAsc(id);
        return photos.stream()
                .map(this::mapToPhotoResponse)
                .collect(Collectors.toList());
    }

    public void deletePhoto(UUID id) {
        var photo = photoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Photo not found"));

        deletePhotoFromS3(photo);

        photoRepository.deleteById(id);
    }

    public void deletePhotosByGalleryId(UUID galleryId) {
        List<Photo> photos = photoRepository.findByGalleryIdOrderBySortOrderAsc(galleryId);
        
        for (Photo photo : photos) {
            deletePhotoFromS3(photo);
        }
        
        photoRepository.deleteAll(photos);
    }

    private void deletePhotoFromS3(Photo photo) {
        try {
            if (photo.getVersions() != null) {
                for (String key : photo.getVersions().values()) {
                    deleteFromS3(key);
                }
            }

            if (photo.getObjectKey() != null && 
                (photo.getVersions() == null || !photo.getVersions().containsValue(photo.getObjectKey()))) {
                deleteFromS3(photo.getObjectKey());
            }
        } catch (Exception e) {
            System.err.println("Failed to delete photo from S3: " + e.getMessage());
        }
    }

    private void deleteFromS3(String key) {
        try {
            DeleteObjectRequest deleteRequest = DeleteObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();
            s3Client.deleteObject(deleteRequest);
        } catch (Exception e) {
            System.err.println("Failed to delete object from S3 (key: " + key + "): " + e.getMessage());
        }
    }

    private BufferedImage createThumbnail(BufferedImage originalImage, int maxWidth) {
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();

        int thumbWidth = maxWidth;
        int thumbHeight = (int) ((double) originalHeight * maxWidth / originalWidth);

        if (originalHeight > originalWidth) {
            thumbHeight = maxWidth;
            thumbWidth = (int) ((double) originalWidth * maxWidth / originalHeight);
        }

        BufferedImage thumbnail = new BufferedImage(thumbWidth, thumbHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = thumbnail.createGraphics();

        try {
            g2d.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
            g2d.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);

            g2d.drawImage(originalImage, 0, 0, thumbWidth, thumbHeight, null);
        } finally {
            g2d.dispose();
        }

        return thumbnail;
    }

    private void uploadToS3(String key, byte[] content, String contentType) {
        try {
            PutObjectRequest.Builder requestBuilder = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(contentType);

            PutObjectRequest putObjectRequest = requestBuilder.build();
            RequestBody requestBody = RequestBody.fromBytes(content);

            s3Client.putObject(putObjectRequest, requestBody);
        } catch (software.amazon.awssdk.services.s3.model.S3Exception e) {
            throw new RuntimeException("Failed to upload to S3: " + e.getMessage() +
                    " (Status: " + e.statusCode() + ", Request ID: " + e.requestId() + ")", e);
        }
    }

    private PhotoResponse mapToPhotoResponse(Photo photo) {
        Map<String, String> versionUrls = new HashMap<>();
        if (photo.getVersions() != null) {
            photo.getVersions().forEach((version, key) -> {
                String url = s3UrlService.getPublicUrl(key);
                if (url != null) {
                    versionUrls.put(version, url);
                }
            });
        }

        return PhotoResponse.builder()
                .id(photo.getId())
                .objectKey(photo.getObjectKey())
                .bucket(photo.getBucket())
                .originalName(photo.getOriginalName())
                .contentType(photo.getContentType())
                .sizeBytes(photo.getSizeBytes())
                .width(photo.getWidth())
                .height(photo.getHeight())
                .versions(versionUrls.isEmpty() ? photo.getVersions() : versionUrls)
                .versionKeys(photo.getVersions())
                .galleryId(photo.getGalleryId())
                .caption(photo.getCaption())
                .altText(photo.getAltText())
                .sortOrder(photo.getSortOrder())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}
