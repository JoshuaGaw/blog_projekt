package de.essenmeile.blog.config;

import de.essenmeile.blog.service.FileStorageService;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web-Konfiguration:
 *  - CORS: erlaubte Frontend-Origins ueber app.cors.allowed-origins (kommagetrennt).
 *    Fuer eine andere Maschine einfach diese Property anpassen.
 *  - Statische Auslieferung der hochgeladenen Bilder unter /uploads/**.
 */
@Configuration
@RequiredArgsConstructor
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;
    private final FileStorageService fileStorage;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
        // allowCredentials bewusst NICHT gesetzt - es gibt (noch) keine Auth/Cookies.
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Dateien aus dem Upload-Verzeichnis unter /uploads/** ausliefern.
        // toUri() liefert bei einem existierenden Verzeichnis eine URL mit "/" am Ende.
        String location = fileStorage.getUploadDir().toUri().toString();
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
}
