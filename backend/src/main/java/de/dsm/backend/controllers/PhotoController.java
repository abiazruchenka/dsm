package de.dsm.backend.controllers;

import de.dsm.backend.models.dto.PhotoResponse;
import de.dsm.backend.models.entity.Photo;
import de.dsm.backend.services.PhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
@Validated
@Tag(name = "Photos", description = "Photo upload and management operations")
public class PhotoController {

    private final PhotoService photoService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Upload a photo", description = "Uploads a photo file to S3 and saves metadata to database")
    public PhotoResponse uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "caption", required = false) String caption,
            @RequestParam(value = "altText", required = false) String altText
    ) throws IOException {
        Photo photo = photoService.uploadFile(file, caption, altText);
        return mapToResponse(photo);
    }

    private PhotoResponse mapToResponse(Photo photo) {
        return PhotoResponse.builder()
                .id(photo.getId())
                .objectKey(photo.getObjectKey())
                .bucket(photo.getBucket())
                .originalName(photo.getOriginalName())
                .contentType(photo.getContentType())
                .sizeBytes(photo.getSizeBytes())
                .width(photo.getWidth())
                .height(photo.getHeight())
                .versions(photo.getVersions())
                .galleryId(photo.getGalleryId())
                .caption(photo.getCaption())
                .altText(photo.getAltText())
                .sortOrder(photo.getSortOrder())
                .isPublished(photo.getIsPublished())
                .createdAt(photo.getCreatedAt())
                .build();
    }
}
