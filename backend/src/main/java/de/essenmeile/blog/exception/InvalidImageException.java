package de.essenmeile.blog.exception;

/**
 * Wird geworfen, wenn eine hochgeladene Bilddatei ein ungueltiges Format hat.
 * Fuehrt ueber den GlobalExceptionHandler zu HTTP 415.
 */
public class InvalidImageException extends RuntimeException {

    public InvalidImageException(String message) {
        super(message);
    }
}
