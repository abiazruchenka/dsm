package de.dsm.backend.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class S3UrlServiceTest {

    @InjectMocks
    private S3UrlService s3UrlService;

    private static final String BUCKET_NAME = "test-bucket";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(s3UrlService, "bucketName", BUCKET_NAME);
        ReflectionTestUtils.setField(s3UrlService, "friendlyUrlBase", "");
        ReflectionTestUtils.setField(s3UrlService, "s3Endpoint", "");
    }

    @Test
    void getPublicUrl_returnsNull_whenObjectKeyIsNull() {
        assertNull(s3UrlService.getPublicUrl(null));
    }

    @Test
    void getPublicUrl_returnsNull_whenObjectKeyIsEmpty() {
        assertNull(s3UrlService.getPublicUrl(""));
    }

    @Test
    void getPublicUrl_usesFriendlyUrlBase_whenConfigured() {
        ReflectionTestUtils.setField(s3UrlService, "friendlyUrlBase", "https://cdn.example.com/");

        String result = s3UrlService.getPublicUrl("original/photo.jpg");

        assertEquals("https://cdn.example.com/test-bucket/original/photo.jpg", result);
    }

    @Test
    void getPublicUrl_addsTrailingSlash_toFriendlyUrlBase_whenMissing() {
        ReflectionTestUtils.setField(s3UrlService, "friendlyUrlBase", "https://cdn.example.com");

        String result = s3UrlService.getPublicUrl("original/photo.jpg");

        assertEquals("https://cdn.example.com/test-bucket/original/photo.jpg", result);
    }

    @Test
    void getPublicUrl_stripsLeadingSlash_fromObjectKey() {
        ReflectionTestUtils.setField(s3UrlService, "friendlyUrlBase", "https://cdn.example.com/");

        String result = s3UrlService.getPublicUrl("/original/photo.jpg");

        assertEquals("https://cdn.example.com/test-bucket/original/photo.jpg", result);
    }

    @Test
    void getPublicUrl_usesS3Endpoint_whenFriendlyUrlBaseEmpty() {
        ReflectionTestUtils.setField(s3UrlService, "s3Endpoint", "s3.eu-central-003.backblazeb2.com");

        String result = s3UrlService.getPublicUrl("original/photo.jpg");

        assertEquals("https://s3.eu-central-003.backblazeb2.com/test-bucket/original/photo.jpg", result);
    }

    @Test
    void getPublicUrl_stripsHttpFromEndpoint() {
        ReflectionTestUtils.setField(s3UrlService, "s3Endpoint", "https://s3.example.com");

        String result = s3UrlService.getPublicUrl("key.jpg");

        assertEquals("https://s3.example.com/test-bucket/key.jpg", result);
    }

    @Test
    void getPublicUrl_prefersFriendlyUrlBase_overS3Endpoint() {
        ReflectionTestUtils.setField(s3UrlService, "friendlyUrlBase", "https://cdn.example.com/");
        ReflectionTestUtils.setField(s3UrlService, "s3Endpoint", "https://s3.example.com");

        String result = s3UrlService.getPublicUrl("photo.jpg");

        assertEquals("https://cdn.example.com/test-bucket/photo.jpg", result);
    }

    @Test
    void getPublicUrl_returnsNull_whenNeitherConfigured() {
        ReflectionTestUtils.setField(s3UrlService, "friendlyUrlBase", "");
        ReflectionTestUtils.setField(s3UrlService, "s3Endpoint", "");

        assertNull(s3UrlService.getPublicUrl("photo.jpg"));
    }
}
