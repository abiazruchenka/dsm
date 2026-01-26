package de.dsm.backend.models.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "galleries")
public class Gallery {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    private String title;
    private String image;
    private String description;
    private boolean is_published;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected Gallery(String title, String image, String description, boolean is_published) {
        this.title = title;
        this.description = description;
        this.image = image;
        this.is_published = is_published;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void markAsPublished() {
        this.is_published = true;
    }
}
