package de.essenmeile.blog;

import static org.assertj.core.api.Assertions.assertThat;

import de.essenmeile.blog.model.Image;
import de.essenmeile.blog.model.Post;
import de.essenmeile.blog.repository.ImageRepository;
import de.essenmeile.blog.repository.PostRepository;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Phase-1-Verifikation: prueft, dass die Entities Post/Image sauber auf die
 * echte `blog`-Datenbank gemappt sind, indem echtes SELECT-SQL ausgefuehrt wird.
 * Nur lesend - veraendert keine Daten.
 */
@SpringBootTest
class PersistenceSmokeTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private ImageRepository imageRepository;

    @Test
    void postsLassenSichLesen() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        assertThat(posts).isNotNull();
        System.out.println("[SmokeTest] Posts in DB: " + posts.size());
        // Falls Daten da sind: pruefen, dass die Kernfelder gemappt sind.
        posts.stream().findFirst().ifPresent(p -> {
            assertThat(p.getId()).isNotNull();
            assertThat(p.getTitle()).isNotNull();
            assertThat(p.getCreatedAt()).isNotNull();
        });
    }

    @Test
    void imagesLassenSichLesen() {
        List<Image> images = imageRepository.findAll();
        assertThat(images).isNotNull();
        System.out.println("[SmokeTest] Images in DB: " + images.size());
    }
}
