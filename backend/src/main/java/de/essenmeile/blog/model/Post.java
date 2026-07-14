package de.essenmeile.blog.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Ein Blog-Post. Gemappt auf die bestehende Tabelle `posts`.
 * Spalten: id, title, description, content, created_at, updated_at.
 * Lombok erzeugt Getter/Setter. Bewusst KEIN @Data / @ToString / @EqualsAndHashCode:
 * die @OneToMany-Beziehung zu Image wuerde sonst Endlos-Rekursion verursachen.
 */
@Entity
@Table(name = "posts")
@Getter
@Setter
public class Post {

    private static final ZoneId TIMEZONE = ZoneId.of("Europe/Berlin");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 150)
    private String title;

    // In der DB ein TEXT-Feld (nicht varchar), daher columnDefinition.
    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Ein Post kann mehrere Bilder haben (aktuell nur eins mit is_cover=1).
    // cascade + orphanRemoval: Beim Loeschen des Posts werden die Bild-Zeilen
    // mitgeloescht - das ersetzt das manuelle "DELETE FROM images" aus dem PHP-Code.
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Image> images = new ArrayList<>();

    // Zeitstempel setzen wie im PHP-Backend: bei INSERT beide auf jetzt (NOW()),
    // bei UPDATE nur updated_at.
    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now(TIMEZONE);
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        this.updatedAt = LocalDateTime.now(TIMEZONE);
    }

    /** Verknuepft ein Bild bidirektional mit diesem Post. */
    public void addImage(Image image) {
        images.add(image);
        image.setPost(this);
    }

    /** Loest ein Bild vom Post (wird durch orphanRemoval aus der DB entfernt). */
    public void removeImage(Image image) {
        images.remove(image);
        image.setPost(null);
    }
}
