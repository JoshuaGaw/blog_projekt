package de.essenmeile.blog.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

/**
 * Ein hochgeladenes Bild. Gemappt auf die bestehende Tabelle `images`.
 * Spalten: id, post_id, file_path, is_cover.
 * Lombok erzeugt Getter/Setter. Bewusst KEIN @Data / @ToString / @EqualsAndHashCode:
 * die @ManyToOne-Beziehung zu Post wuerde sonst Endlos-Rekursion verursachen.
 */
@Entity
@Table(name = "images")
@Getter
@Setter
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Besitzende Seite der Beziehung: die Spalte post_id liegt hier.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(name = "file_path", nullable = false, length = 100)
    private String filePath;

    // Feld heisst `cover` -> Lombok erzeugt isCover()/setCover(); Spalte bleibt is_cover.
    @Column(name = "is_cover", nullable = false)
    private boolean cover;
}
