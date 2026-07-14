package de.essenmeile.blog.service;

import de.essenmeile.blog.exception.InvalidImageException;
import de.essenmeile.blog.exception.ValidationException;
import lombok.Getter;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Speichert ein hochgeladenes Bild, das als Data-URL (Base64) im JSON-Body
 * ankommt, z. B. "data:image/png;base64,iVBORw0K...". Gibt den relativen Pfad
 * zurueck ("uploads/<name>"), der in images.file_path landet.
 */
@Service
public class FileStorageService {

    private static final long MAX_BYTES = 5L * 1024 * 1024; // 5 MB (dekodiert)

    // data:<mime>;base64,<daten>  -> Gruppe 1 = MIME, Gruppe 2 = Base64
    private static final Pattern DATA_URL =
            Pattern.compile("^data:(image/[\\w.+-]+);base64,(.+)$", Pattern.DOTALL);

    @Getter
    private final Path uploadDir;

    public FileStorageService(@Value("${app.uploads.dir}") String uploadDir) {
        this.uploadDir = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new UncheckedIOException("Upload-Verzeichnis konnte nicht angelegt werden: " + this.uploadDir, e);
        }
    }

    /**
     * Validiert und speichert das Bild aus einer Data-URL. Gibt den relativen
     * Pfad (z. B. "uploads/img_ab12cd.png") zurueck.
     */
    public String store(String dataUrl) {
        Matcher matcher = DATA_URL.matcher(dataUrl == null ? "" : dataUrl);
        if (!matcher.matches()) {
            throw new InvalidImageException(
                    "Ungültiges Bildformat. Erlaubt: jpg, jpeg, png, gif, webp.");
        }

        String extension = extensionForMime(matcher.group(1));
        if (extension == null) {
            throw new InvalidImageException(
                    "Ungültiges Bildformat. Erlaubt: jpg, jpeg, png, gif, webp.");
        }

        byte[] bytes;
        try {
            bytes = Base64.getDecoder().decode(matcher.group(2));
        } catch (IllegalArgumentException _) {
            throw new InvalidImageException("Die Bilddaten sind kein gültiges Base64.");
        }
        if (bytes.length > MAX_BYTES) {
            throw new ValidationException("Die Datei ist zu groß. Maximal 5 MB sind erlaubt.");
        }

        String filename = "img_" + UUID.randomUUID().toString().replace("-", "") + "." + extension;
        Path target = uploadDir.resolve(filename);
        try {
            Files.write(target, bytes);
        } catch (IOException e) {
            throw new UncheckedIOException("Datei konnte nicht gespeichert werden.", e);
        }
        return "uploads/" + filename;
    }

    private String extensionForMime(String mime) {
        return switch (mime.toLowerCase(Locale.ROOT)) {
            case "image/jpeg", "image/jpg" -> "jpg";
            case "image/png" -> "png";
            case "image/gif" -> "gif";
            case "image/webp" -> "webp";
            default -> null;
        };
    }
}
