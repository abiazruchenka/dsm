package de.dsm.backend.services;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.CannedAccessControlList;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;
import de.dsm.backend.models.entity.Photo;
import de.dsm.backend.repositories.PhotoRepository;
import org.imgscalr.Scalr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
public class PhotoService {

    @Autowired
    private AmazonS3 s3Client;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Value("${admin.image.thumbsize}")
    private int thumbSize;

    @Autowired
    private PhotoRepository photoRepository;

    public Photo uploadFile(MultipartFile file, String caption, String altText) throws IOException {

        byte[] fileBytes = file.getBytes();
        
        try (InputStream inputStream = new ByteArrayInputStream(fileBytes)) {
            var image = ImageIO.read(inputStream);

            if (image == null){
                throw new IllegalArgumentException("Wrong image format");
            }

            String baseName = UUID.randomUUID().toString();
            String objectKey = "original/" + baseName + "_" + file.getOriginalFilename();
            String thumbKey = "thumbs/" + baseName + "_thumb.webp";

            var width = image.getWidth();
            var height = image.getHeight();

            var thumbImage = Scalr.resize(image, Scalr.Method.AUTOMATIC, Scalr.Mode.FIT_TO_WIDTH, thumbSize);

            // Upload original file
            uploadToS3(objectKey, new ByteArrayInputStream(fileBytes), file.getContentType(), file.getSize());

            var thumbOs = new ByteArrayOutputStream();
            ImageIO.write(thumbImage, "webp", thumbOs);
            byte[] thumbBytes = thumbOs.toByteArray();
            uploadToS3(thumbKey, new ByteArrayInputStream(thumbBytes), "image/webp", (long) thumbBytes.length);

            Map<String, String> versions = new HashMap<>();

            versions.put("original", objectKey);
            versions.put("thumbnail", thumbKey);

            var photo = Photo.builder()
                            .objectKey(objectKey)
                            .bucket(bucketName)
                            .originalName(file.getOriginalFilename())
                            .contentType(file.getContentType())
                            .sizeBytes(file.getSize())
                            .width(width)
                            .height(height)
                            .versions(versions)
                            .caption(caption != null && !caption.isEmpty() ? caption : null)
                            .altText(altText != null && !altText.isEmpty() ? altText : null)
                            .isPublished(true)
                            .build();

            return photoRepository.save(photo);
        }
    }

    private void uploadToS3(String key, InputStream is, String contentType, Long size) {
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentType(contentType);
        metadata.setContentLength(size);
        s3Client.putObject(new PutObjectRequest(bucketName, key, is, metadata)
                .withCannedAcl(CannedAccessControlList.PublicRead));
    }
}
