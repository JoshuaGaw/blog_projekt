package de.essenmeile.blog.mapper;

import de.essenmeile.blog.api.model.PostResponse;
import de.essenmeile.blog.model.Image;
import de.essenmeile.blog.model.Post;
import java.util.List;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

/**
 * Mappt die JPA-Entity {@link Post} auf das aus post-api.yaml generierte Modell
 * {@link PostResponse}. MapStruct erzeugt die Implementierung zur Compile-Zeit
 * (kein Reflection, voll typsicher).
 * Bewusst nur die Response-Richtung: Die Request-Seite (create/update) baut die
 * Entity von Hand, weil dort Logik steckt (trim, Leerwert-Ersetzung, Datei-Upload) -
 * das ist kein reines Feld-Mapping und gehoert nicht in einen Mapper.
 * componentModel = "spring" -> die generierte Implementierung ist eine @Component
 * und kann per Konstruktor injiziert werden.
 */
@Mapper(componentModel = "spring")
public interface PostMapper {

    // id/title/description/content/createdAt/updatedAt werden per Namensgleichheit
    // automatisch gemappt. coverImage wird aus der Bilderliste abgeleitet.
    @Mapping(target = "coverImage", source = "images", qualifiedByName = "coverImagePath")
    PostResponse toResponse(Post post);

    // MapStruct erzeugt die Listen-Variante automatisch auf Basis von toResponse.
    List<PostResponse> toResponseList(List<Post> posts);

    /** Ermittelt den Pfad des Cover-Bilds (is_cover = true) oder null. */
    @Named("coverImagePath")
    default String coverImagePath(List<Image> images) {
        if (images == null) {
            return null;
        }
        return images.stream()
                .filter(Image::isCover)
                .map(Image::getFilePath)
                .findFirst()
                .orElse(null);
    }
}
