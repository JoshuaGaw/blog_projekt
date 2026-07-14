import { Component, inject, signal, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {PostsService, PostRequest, PostResponse} from '../api';

/**
 * Startseite: Liste der Posts (erster als Hero), Suche und ein Formular zum
 * Anlegen. Der Zustand liegt in Signals - aendert er sich, rendert Angular
 * automatisch neu (kein manuelles DOM-Bauen).
 */
@Component({
  selector: 'app-post-list',
  imports: [FormsModule],
  templateUrl: './post-list.html',
  styleUrl: './post-list.css',
})
export class PostList implements OnInit {
  private readonly postService = inject(PostsService);
  private readonly router = inject(Router);

  posts = signal<PostResponse[]>([]);
  showForm = signal(false);
  error = signal<string | null>(null);

  // Formularfelder (Two-Way-Binding via [(ngModel)])
  title = '';
  description = '';
  content = '';
  imageDataUrl: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(search?: string): void {
    this.postService.listPosts(search).subscribe({
      next: (data) => this.posts.set(data),
      error: () => this.error.set('Laden fehlgeschlagen.'),
    });
  }

  onSearch(term: string): void {
    this.load(term.trim() || undefined);
  }

  open(id: number): void {
    this.router.navigate(['/posts', id]);
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      this.imageDataUrl = null;
      return;
    }
    const reader = new FileReader();
    reader.onload = () => (this.imageDataUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  save(): void {
    this.error.set(null);
    const body: PostRequest = {
      title: this.title,
      description: this.description,
      content: this.content,
    };
    if (this.imageDataUrl) {
      body.image = this.imageDataUrl;
    }
    this.postService.createPost(body).subscribe({
      next: () => {
        this.resetForm();
        this.load();
      },
      // Backend liefert bei Validierungsfehlern { "error": "..." }
      error: (err) => this.error.set(err?.error?.error ?? 'Speichern fehlgeschlagen.'),
    });
  }

  resetForm(): void {
    this.title = '';
    this.description = '';
    this.content = '';
    this.imageDataUrl = null;
    this.showForm.set(false);
    this.error.set(null);
  }
}
