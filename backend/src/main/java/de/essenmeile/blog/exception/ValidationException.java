package de.essenmeile.blog.exception;

/**
 * Wird bei ungueltiger Eingabe geworfen (leerer Titel, zu lange Felder).
 * Fuehrt ueber den GlobalExceptionHandler zu HTTP 400.
 */
public class ValidationException extends RuntimeException {

    public ValidationException(String message) {
        super(message);
    }
}
