package de.dsm.backend.controllers;

import de.dsm.backend.models.dto.PhotoResponse;
import de.dsm.backend.services.PhotoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

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
            @RequestParam(value = "altText", required = false) String altText,
            @RequestParam(value = "galleryId", required = false) UUID galleryId,
            @RequestParam(value = "blockId", required = false) UUID blockId
    ) throws IOException {
        return photoService.uploadFile(file, caption, altText, galleryId, blockId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a photo", description = "Deletes a photo from S3 and database")
    public void deletePhoto(@PathVariable UUID id) {
        photoService.deletePhoto(id);
    }
}
