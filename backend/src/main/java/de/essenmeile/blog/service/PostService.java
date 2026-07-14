package de.essenmeile.blog.service;

import de.essenmeile.blog.api.model.PostRequest;
import de.essenmeile.blog.api.model.PostResponse;
import de.essenmeile.blog.exception.NotFoundException;
import de.essenmeile.blog.mapper.PostMapper;
import de.essenmeile.blog.model.Image;
import de.essenmeile.blog.model.Post;
import de.essenmeile.blog.repository.PostRepository;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Geschaeftslogik rund um Posts. Nimmt das aus post-api.yaml generierte
 * {@link PostRequest} entgegen und gibt das generierte {@link PostResponse}
 * zurueck (contract-first). Das Entity->Response-Mapping uebernimmt der
 * {@link PostMapper} (MapStruct).
 * Die Feld-Validierung (Pflicht/Laenge) passiert deklarativ ueber Bean Validation
 * am {@link PostRequest} (@NotNull/@Size) - hier gibt es daher keine manuelle
 * Pruefung mehr. Nur das Bild (Data-URL) wird im FileStorageService geprueft.
 */
@Service
@RequiredArgsConstructor
public class PostService {

    public static final String POST_NICHT_GEFUNDEN = "Post nicht gefunden.";

    private final PostRepository postRepository;
    private final FileStorageService fileStorage;
    private final PostMapper postMapper;

    @Transactional(readOnly = true)
    public List<PostResponse> findAll() {
        return allPosts();
    }

    // Gemeinsame Logik von findAll() und search(). Bewusst als private Methode:
    // search() ruft NICHT this.findAll() auf - ein solcher Selbstaufruf wuerde den
    // Spring-Proxy umgehen, sodass die @Transactional-Grenze der aufgerufenen Methode
    // nicht griffe. Ein privater Aufruf laeuft dagegen unkritisch in der Transaktion
    // der oeffentlichen Einstiegsmethode mit.
    private List<PostResponse> allPosts() {
        return postMapper.toResponseList(postRepository.findAllByOrderByCreatedAtDesc());
    }

    /**
     * Wortsuche wie im PHP-Backend: Suchbegriff in Woerter zerlegen, pro Wort eine
     * (title OR description OR content)-LIKE-Bedingung, alle Woerter mit AND verknuepft.
     */
    @Transactional(readOnly = true)
    public List<PostResponse> search(String rawQuery) {
        List<String> words = Arrays.stream(rawQuery.trim().split("\\s+"))
                .filter(w -> !w.isBlank())
                .toList();
        if (words.isEmpty()) {
            return allPosts();
        }

        Specification<Post> spec = (root, _, cb) -> {
            List<Predicate> perWord = new ArrayList<>();
            for (String word : words) {
                String like = "%" + word + "%";
                perWord.add(cb.or(
                        cb.like(root.get("title"), like),
                        cb.like(root.get("description"), like),
                        cb.like(root.get("content"), like)
                ));
            }
            return cb.and(perWord.toArray(new Predicate[0]));
        };

        return postMapper.toResponseList(
                postRepository.findAll(spec, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    @Transactional(readOnly = true)
    public PostResponse findById(Integer id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(POST_NICHT_GEFUNDEN));
        return postMapper.toResponse(post);
    }

    @Transactional
    public PostResponse create(PostRequest request) {
        Post post = new Post();
        post.setTitle(request.getTitle().trim());
        post.setDescription(coalesce(request.getDescription()));
        post.setContent(coalesce(request.getContent()));

        if (hasImage(request)) {
            addCover(post, request.getImage());
        }

        return postMapper.toResponse(postRepository.save(post));
    }

    @Transactional
    public PostResponse update(Integer id, PostRequest request) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(POST_NICHT_GEFUNDEN));

        post.setTitle(request.getTitle().trim());
        post.setDescription(coalesce(request.getDescription()));
        post.setContent(coalesce(request.getContent()));

        if (hasImage(request)) {
            // Altes Cover ersetzen: bestehende Cover-Bilder entfernen (orphanRemoval
            // loescht die DB-Zeilen), dann neues Cover anlegen.
            List<Image> existingCovers = post.getImages().stream()
                    .filter(Image::isCover)
                    .toList();
            existingCovers.forEach(post::removeImage);
            addCover(post, request.getImage());
        }

        // post ist managed -> Aenderungen werden beim Commit geflusht (@PreUpdate setzt updated_at).
        return postMapper.toResponse(post);
    }

    @Transactional
    public void delete(Integer id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new NotFoundException(POST_NICHT_GEFUNDEN));
        // cascade + orphanRemoval loeschen die zugehoerigen images-Zeilen mit.
        postRepository.delete(post);
    }

    private boolean hasImage(PostRequest request) {
        // true, wenn ein nicht-leeres Bild vorhanden ist. Kein Optional.get():
        // ofNullable faengt null ab, filter wirft leere/blanke Werte raus.
        return Optional.ofNullable(request.getImage())
                .filter(image -> !image.isBlank())
                .isPresent();
    }

    private void addCover(Post post, String imageDataUrl) {
        String path = fileStorage.store(imageDataUrl);
        Image cover = new Image();
        cover.setFilePath(path);
        cover.setCover(true);
        post.addImage(cover);
    }

    private static String coalesce(String value) {
        return value == null ? "" : value.trim();
    }
}
