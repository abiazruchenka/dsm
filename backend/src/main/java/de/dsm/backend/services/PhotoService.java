package de.dsm.backend.services;

import de.dsm.backend.models.entity.Photo;
import de.dsm.backend.repositories.PhotoRepository;
import org.imgscalr.Scalr;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import javax.imageio.ImageIO;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private final S3Client s3Client;
    private final PhotoRepository photoRepository;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Value("${admin.image.thumbsize}")
    private int thumbSize;

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

            uploadToS3(objectKey, fileBytes, file.getContentType());

            var thumbOs = new ByteArrayOutputStream();
            ImageIO.write(thumbImage, "webp", thumbOs);
            byte[] thumbBytes = thumbOs.toByteArray();
            uploadToS3(thumbKey, thumbBytes, "image/webp");

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
}
