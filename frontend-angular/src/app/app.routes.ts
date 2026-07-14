import { Routes } from '@angular/router';
import { PostList } from './post-list/post-list';
import { PostDetail } from './post-detail/post-detail';

// URL -> Component (das Frontend-Pendant zu @RequestMapping im Backend).
export const routes: Routes = [
  { path: '', component: PostList },
  { path: 'posts/:id', component: PostDetail },
];
