package de.essenmeile.blog.exception;

/**
 * Wird geworfen, wenn eine angeforderte Ressource (z. B. ein Post) nicht existiert.
 * Fuehrt ueber den GlobalExceptionHandler zu HTTP 404.
 */
public class NotFoundException extends RuntimeException {

    public NotFoundException(String message) {
        super(message);
    }
}
