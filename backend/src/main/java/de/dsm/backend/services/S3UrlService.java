package de.dsm.backend.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class S3UrlService {

    @Value("${storage.s3.friendly-url-base:}")
    private String friendlyUrlBase;

    @Value("${storage.s3.bucket-name}")
    private String bucketName;

    @Value("${storage.s3.endpoint:}")
    private String s3Endpoint;

    public String getPublicUrl(String objectKey) {
        if (objectKey == null || objectKey.isEmpty()) {
            return null;
        }

        // If Friendly URL base is configured, use it
        if (friendlyUrlBase != null && !friendlyUrlBase.trim().isEmpty()) {
            String base = friendlyUrlBase.trim();
            // Ensure base ends with /
            if (!base.endsWith("/")) {
                base += "/";
            }
            // Remove leading / from objectKey if present
            String cleanKey = objectKey.startsWith("/") ? objectKey.substring(1) : objectKey;
            return base + bucketName + "/" + cleanKey;
        }

        // Fallback to S3 API URL
        if (s3Endpoint != null && !s3Endpoint.trim().isEmpty()) {
            String endpoint = s3Endpoint.trim();
            // Remove protocol if present
            if (endpoint.startsWith("http://") || endpoint.startsWith("https://")) {
                endpoint = endpoint.replaceFirst("^https?://", "");
            }
            String cleanKey = objectKey.startsWith("/") ? objectKey.substring(1) : objectKey;
            return "https://" + endpoint + "/" + bucketName + "/" + cleanKey;
        }

        return null;
    }
}
