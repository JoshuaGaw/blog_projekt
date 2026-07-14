package de.essenmeile.blog.repository;

import de.essenmeile.blog.model.Post;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

/**
 * Datenzugriff fuer {@link Post}. Spring Data JPA generiert die Implementierung
 * zur Laufzeit; CRUD (save, findById, delete, ...) kommt aus JpaRepository.
 * JpaSpecificationExecutor liefert die dynamische Wortsuche (siehe PostService).
 */
public interface PostRepository extends JpaRepository<Post, Integer>, JpaSpecificationExecutor<Post> {

    // Liste absteigend nach Erstelldatum - wie "ORDER BY created_at DESC" im PHP-Backend.
    List<Post> findAllByOrderByCreatedAtDesc();
}
