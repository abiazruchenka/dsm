package de.dsm.backend.models.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "photos")
public class Photo {
    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "object_key", unique = true, nullable = false)
    private String objectKey;

    private String bucket;
    private String originalName;
    private String contentType;
    private Long sizeBytes;
    private Integer width;
    private Integer height;
}
