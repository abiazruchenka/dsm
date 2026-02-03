package de.dsm.backend.controllers;

import de.dsm.backend.models.dto.GalleryRequest;
import de.dsm.backend.models.dto.GalleryResponse;
import de.dsm.backend.models.dto.PhotoResponse;
import de.dsm.backend.services.GalleryService;
import de.dsm.backend.services.PhotoService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/galleries")
@RequiredArgsConstructor
@Validated
@Tag(name = "Galleries", description = "Galleries management operations")
public class GalleryController {
    private final GalleryService galleryService;
    private final PhotoService photoService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GalleryResponse createGallery(@Valid @RequestBody GalleryRequest galleryRequest) {
        return galleryService.createGallery(galleryRequest);
    }

    @GetMapping
    public List<GalleryResponse> getGalleries() {
        return galleryService.getAllPublishedGalleries();
    }

    @GetMapping("/all")
    public List<GalleryResponse> getAllGalleries() {
        return galleryService.getAllGalleries();
    }

    @GetMapping("/{id}")
    public List<PhotoResponse> getGalleryPhotos(@PathVariable UUID id) {
        return photoService.getPhotos(id);
    }

    @PatchMapping("/{id}")
    public GalleryResponse updateGallery(@PathVariable UUID id, @Valid @RequestBody GalleryRequest request) {
        return galleryService.updateGallery(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGallery(@PathVariable UUID id) {
        galleryService.deleteGallery(id);
    }
}
