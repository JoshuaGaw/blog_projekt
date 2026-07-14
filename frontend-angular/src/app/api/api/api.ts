export * from './posts.service';
import { PostsService } from './posts.service';
export * from './uploads.service';
import { UploadsService } from './uploads.service';
export const APIS = [PostsService, UploadsService];
