package de.essenmeile.blog.exception;

import de.essenmeile.blog.api.model.ApiError;
import org.springframework.http.HttpStatus;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Zentrale Fehlerbehandlung. Uebersetzt Exceptions in das aus post-api.yaml
 * generierte Fehler-Modell {@link ApiError} ({"error": "..."}) mit passendem
 * HTTP-Status.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(NotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ApiError handleNotFound(NotFoundException ex) {
        return new ApiError(ex.getMessage());
    }

    // Bean-Validation-Fehler des @Valid @RequestBody PostRequest. Die generierten
    // @NotNull/@Size-Constraints tragen englische Default-Meldungen - wir uebersetzen
    // sie hier zentral in die vertrauten deutschen Texte.
    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleBeanValidation(MethodArgumentNotValidException ex) {
        FieldError fieldError = ex.getBindingResult().getFieldErrors().stream()
                .findFirst()
                .orElse(null);
        return new ApiError(germanMessage(fieldError));
    }

    // Ungueltige Eingabe abseits der Constraints (z. B. Bild zu gross).
    @ExceptionHandler(ValidationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ApiError handleValidation(ValidationException ex) {
        return new ApiError(ex.getMessage());
    }

    @ExceptionHandler(InvalidImageException.class)
    @ResponseStatus(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
    public ApiError handleInvalidImage(InvalidImageException ex) {
        return new ApiError(ex.getMessage());
    }

    private String germanMessage(FieldError fieldError) {
        if (fieldError == null) {
            return "Ungültige Eingabe.";
        }
        Object rejected = fieldError.getRejectedValue();
        return switch (fieldError.getField()) {
            case "title" -> (rejected == null || rejected.toString().isBlank())
                    ? "Ein Titel ist erforderlich."
                    : "Der Titel darf maximal 32 Zeichen lang sein.";
            case "description" -> "Die Beschreibung darf maximal 180 Zeichen lang sein.";
            case "content" -> "Der Inhalt darf maximal 2000 Zeichen lang sein.";
            default -> fieldError.getDefaultMessage();
        };
    }
}
