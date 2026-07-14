package de.essenmeile.blog.repository;

import de.essenmeile.blog.model.Image;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Datenzugriff fuer {@link Image}.
 */
public interface ImageRepository extends JpaRepository<Image, Integer> {
}
