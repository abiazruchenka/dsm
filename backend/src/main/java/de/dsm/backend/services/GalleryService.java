package de.dsm.backend.services;

import de.dsm.backend.models.dto.GalleryRequest;
import de.dsm.backend.models.entity.Gallery;
import de.dsm.backend.repositories.GalleryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GalleryService {
    private final GalleryRepository galleryRepository;

    public List<Gallery> createGallery(GalleryRequest galleryRequest){
        var galleryList = new ArrayList<Gallery>();
        return galleryList;
    }

    public Gallery getGallery(UUID id){
        return galleryRepository.getReferenceById(id);
    }

    public void deleteGallery(UUID id) {

    }

    public List<Gallery> updateGallery(GalleryRequest galleryRequest) {
        var galleryList = new ArrayList<Gallery>();
        return galleryList;
    }
}
