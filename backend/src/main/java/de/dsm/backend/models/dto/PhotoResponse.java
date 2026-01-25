package de.dsm.backend.models.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoResponse {
    private UUID id;
    private String objectKey;
    private String bucket;
    private String originalName;
    private String contentType;
    private Long sizeBytes;
    private Integer width;
    private Integer height;
    private Map<String, String> versions;
    private UUID galleryId;
    private String caption;
    private String altText;
    private Integer sortOrder;
    private Boolean isPublished;
    private LocalDateTime createdAt;
}
