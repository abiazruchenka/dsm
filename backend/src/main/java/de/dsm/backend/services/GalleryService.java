package de.dsm.backend.services;

import de.dsm.backend.models.dto.GalleryRequest;
import de.dsm.backend.models.dto.GalleryResponse;
import de.dsm.backend.models.entity.Gallery;
import de.dsm.backend.repositories.GalleryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GalleryService {
    private final S3UrlService s3UrlService;
    private final GalleryRepository galleryRepository;
    private final PhotoService photoService;

    public GalleryResponse createGallery(GalleryRequest galleryRequest) {
        var gallery = new Gallery();
        Map<String, String> titles = galleryRequest.titles() != null ? galleryRequest.titles() : Map.of();
        Map<String, String> descs = galleryRequest.descriptions() != null ? galleryRequest.descriptions() : Map.of();
        String titleDe = titles.getOrDefault("de", "");
        gallery.setTitle(titleDe);
        gallery.setTitleFr(titles.getOrDefault("fr", titleDe));
        gallery.setTitleEn(titles.getOrDefault("en", titleDe));
        String descDe = descs.getOrDefault("de", "");
        gallery.setDescription(descDe);
        gallery.setDescriptionFr(descs.getOrDefault("fr", descDe));
        gallery.setDescriptionEn(descs.getOrDefault("en", descDe));
        gallery.setPublished(galleryRequest.is_published());
        galleryRepository.save(gallery);
        return mapToResponse(gallery);
    }

    public GalleryResponse updateGallery(UUID id, GalleryRequest galleryRequest) {
        var gallery = galleryRepository.getReferenceById(id);

        gallery.setPublished(galleryRequest.is_published());

        if (galleryRequest.titles() != null && !galleryRequest.titles().isEmpty()) {
            if (galleryRequest.titles().containsKey("de")) gallery.setTitle(galleryRequest.titles().get("de"));
            if (galleryRequest.titles().containsKey("fr")) gallery.setTitleFr(galleryRequest.titles().get("fr"));
            if (galleryRequest.titles().containsKey("en")) gallery.setTitleEn(galleryRequest.titles().get("en"));
        }
        if (galleryRequest.descriptions() != null && !galleryRequest.descriptions().isEmpty()) {
            if (galleryRequest.descriptions().containsKey("de")) gallery.setDescription(galleryRequest.descriptions().get("de"));
            if (galleryRequest.descriptions().containsKey("fr")) gallery.setDescriptionFr(galleryRequest.descriptions().get("fr"));
            if (galleryRequest.descriptions().containsKey("en")) gallery.setDescriptionEn(galleryRequest.descriptions().get("en"));
        }

        if (galleryRequest.image() != null) {
            gallery.setImage(galleryRequest.image());
        }

        galleryRepository.save(gallery);
        return mapToResponse(gallery);
    }

    public Gallery getGallery(UUID id) {
        return galleryRepository.getReferenceById(id);
    }

    public List<GalleryResponse> getAllPublishedGalleries() {
        return galleryRepository.findByIs_publishedTrueOrderByCreatedAtDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<GalleryResponse> getAllGalleries() {
        return galleryRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteGallery(UUID id) {
        photoService.deletePhotosByGalleryId(id);
        
        galleryRepository.deleteById(id);
    }

    private GalleryResponse mapToResponse(Gallery gallery) {
        Map<String, String> titles = new HashMap<>();
        if (gallery.getTitle() != null) titles.put("de", gallery.getTitle());
        if (gallery.getTitleFr() != null) titles.put("fr", gallery.getTitleFr());
        if (gallery.getTitleEn() != null) titles.put("en", gallery.getTitleEn());
        Map<String, String> descriptions = new HashMap<>();
        if (gallery.getDescription() != null) descriptions.put("de", gallery.getDescription());
        if (gallery.getDescriptionFr() != null) descriptions.put("fr", gallery.getDescriptionFr());
        if (gallery.getDescriptionEn() != null) descriptions.put("en", gallery.getDescriptionEn());
        return new GalleryResponse(
                gallery.getId(),
                titles,
                descriptions,
                s3UrlService.getPublicUrl(gallery.getImage()),
                gallery.getPublished(),
                gallery.getCreatedAt()
        );
    }
}
