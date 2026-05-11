package de.dsm.backend.models.entity;

import jakarta.persistence.Column;
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
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@Table(name = "galleries")
public class Gallery {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    private String title;

    @Column(name = "title_fr")
    private String titleFr;

    @Column(name = "title_en")
    private String titleEn;

    private String image;
    private String description;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "is_published")
    private boolean published;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Gallery(String title, String image, String description, boolean published) {
        this.title = title;
        this.description = description;
        this.image = image;
        this.published = published;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean getPublished() {
        return published;
    }
    
    public void setPublished(boolean published) {
        this.published = published;
    }
}
