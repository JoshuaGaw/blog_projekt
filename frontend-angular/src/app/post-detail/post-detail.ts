import { Component, inject, signal, OnInit} from '@angular/core';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {PostsService, PostResponse} from '../api';

/**
 * Detailseite: holt den Post per ID aus der URL und rendert ihn. Loeschen
 * navigiert zurueck zur Liste.
 */
@Component({
  selector: 'app-post-detail',
  imports: [RouterLink],
  templateUrl: './post-detail.html',
  styleUrl: './post-detail.css',
})
export class PostDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly postService = inject(PostsService);

  post = signal<PostResponse | null>(null);
  notFound = signal(false);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.postService.getPost(id).subscribe({
      next: (p) => this.post.set(p),
      error: () => this.notFound.set(true),
    });
  }

  // Relativer Bildpfad -> ueber den Dev-Proxy erreichbare URL.
  coverUrl(path: string | null): string | null {
    return path ? `/${path}` : null;
  }

  wasEdited(p: PostResponse): boolean {
    return new Date(p.updatedAt) > new Date(p.createdAt);
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} um ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr`;
  }

  remove(): void {
    const p = this.post();
    if (!p) {
      return;
    }
    if (!confirm('Diesen Post wirklich löschen?')) {
      return;
    }
    this.postService.deletePost(p.id).subscribe(() => this.router.navigate(['/']));
  }
}
