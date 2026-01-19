package de.dsm.backend.services;

import com.amazonaws.services.s3.AmazonS3;
import de.dsm.backend.models.entity.Photo;
import de.dsm.backend.repositories.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

public class PhotoService {

    @Autowired
    private AmazonS3 s3Client;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Autowired
    private PhotoRepository photoRepository;

    public Photo uploadFile(MultipartFile file) {

        Photo photo = new Photo();
        return photoRepository.save(photo);
    }
}
