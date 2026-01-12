package de.dsm.backend.models.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    private String name;
    private String email;
    private String message;
    private LocalDateTime createdAt;

    public Contact(String name, String email, String message) {
        this.name = name;
        this.email = email;
        this.message = message;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
