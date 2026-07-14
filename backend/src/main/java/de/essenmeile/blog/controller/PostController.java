package de.essenmeile.blog.controller;

import de.essenmeile.blog.api.PostsApi;
import de.essenmeile.blog.api.model.PostRequest;
import de.essenmeile.blog.api.model.PostResponse;
import de.essenmeile.blog.service.PostService;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST-Endpunkte fuer Posts. Implementiert das aus post-api.yaml generierte
 * {@link PostsApi}-Interface (contract-first): Routing, Parameter-Bindung,
 * Rueckgabetypen UND die Bean-Validation-Constraints (@Valid @RequestBody
 * PostRequest) kommen aus dem Contract. Hier steckt nur die Verdrahtung zur
 * Geschaeftslogik.
 */
@RestController
@RequiredArgsConstructor
public class PostController implements PostsApi {

    private final PostService postService;

    @Override
    public ResponseEntity<List<PostResponse>> listPosts(String search) {
        List<PostResponse> posts = (search != null && !search.isBlank())
                ? postService.search(search)
                : postService.findAll();
        return ResponseEntity.ok(posts);
    }

    @Override
    public ResponseEntity<PostResponse> getPost(Integer id) {
        return ResponseEntity.ok(postService.findById(id));
    }

    @Override
    public ResponseEntity<PostResponse> createPost(PostRequest postRequest) {
        PostResponse created = postService.create(postRequest);
        return ResponseEntity.created(URI.create("/api/posts/" + created.getId())).body(created);
    }

    @Override
    public ResponseEntity<PostResponse> updatePost(Integer id, PostRequest postRequest) {
        return ResponseEntity.ok(postService.update(id, postRequest));
    }

    @Override
    public ResponseEntity<Void> deletePost(Integer id) {
        postService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
