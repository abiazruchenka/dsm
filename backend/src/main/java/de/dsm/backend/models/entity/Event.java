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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter
@Setter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor(access = AccessLevel.PUBLIC)
@Table(name = "events")
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @EqualsAndHashCode.Include
    private UUID id;

    private String title;

    @Column(name = "title_fr")
    private String titleFr;

    @Column(name = "title_en")
    private String titleEn;

    @Column(columnDefinition = "TEXT")
    private String text;

    @Column(name = "text_fr", columnDefinition = "TEXT")
    private String textFr;

    @Column(name = "text_en", columnDefinition = "TEXT")
    private String textEn;
    private String image;
    private String link;
    private LocalDate date;

    @Column(name = "is_published")
    private boolean published = true;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
