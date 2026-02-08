package de.dsm.backend.services;

import de.dsm.backend.models.dto.GalleryRequest;
import de.dsm.backend.models.dto.GalleryResponse;
import de.dsm.backend.models.entity.Gallery;
import de.dsm.backend.repositories.GalleryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GalleryService {
    private final S3UrlService s3UrlService;
    private final GalleryRepository galleryRepository;
    private final PhotoService photoService;

    public GalleryResponse createGallery(GalleryRequest galleryRequest) {
        var gallery = new Gallery(galleryRequest.title(), null, galleryRequest.description(), galleryRequest.is_published());
        galleryRepository.save(gallery);
        return mapToResponse(gallery);
    }

    public GalleryResponse updateGallery(UUID id, GalleryRequest galleryRequest) {
        var gallery = galleryRepository.getReferenceById(id);

        gallery.setPublished(galleryRequest.is_published());

        if (galleryRequest.title() != null) {
            gallery.setTitle(galleryRequest.title());
        }
        if (galleryRequest.description() != null) {
            gallery.setDescription(galleryRequest.description());
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
        return new GalleryResponse(
                gallery.getId(),
                gallery.getTitle(),
                gallery.getDescription(),
                s3UrlService.getPublicUrl(gallery.getImage()),
                gallery.getPublished(),
                gallery.getCreatedAt()
        );
    }
}
