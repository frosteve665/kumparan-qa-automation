import { operation } from './graphql-client';

/**
 * GraphQLZero (https://graphqlzero.almansi.me) operations under test.
 * Every input is a declared variable: documents are constants.
 */

export interface User { id: string; name: string; username?: string; email: string }
export interface Post { id: string | null; title: string | null; body?: string | null; user?: User | null }
export interface Photo { id: string; title: string; url: string }
export interface PageMeta { totalCount: number }
export interface PageQueryOptions {
  paginate?: { page?: number; limit?: number };
  sort?: { field?: string; order?: 'ASC' | 'DESC' }[];
  search?: { q?: string };
}

export const GET_POST = operation<{ post: Post | null }, { id: string }>('GetPost', `
  query GetPost($id: ID!) {
    post(id: $id) { id title body user { id name email } }
  }`);

export const LIST_POSTS = operation<{ posts: { data: Post[]; meta: PageMeta } }, { options: PageQueryOptions }>('ListPosts', `
  query ListPosts($options: PageQueryOptions) {
    posts(options: $options) { data { id title } meta { totalCount } }
  }`);

export const GET_USER_WITH_POSTS = operation<{ user: User & { posts: { data: Post[] } } }, { id: string; options: PageQueryOptions }>('GetUserWithPosts', `
  query GetUserWithPosts($id: ID!, $options: PageQueryOptions) {
    user(id: $id) { id name username email posts(options: $options) { data { id title } } }
  }`);

export const GET_ALBUM_PHOTOS = operation<{ album: { id: string; title: string; user: User; photos: { data: Photo[] } } }, { id: string; options: PageQueryOptions }>('GetAlbumPhotos', `
  query GetAlbumPhotos($id: ID!, $options: PageQueryOptions) {
    album(id: $id) { id title user { id name email } photos(options: $options) { data { id title url } } }
  }`);

export const CREATE_POST = operation<{ createPost: Post }, { input: { title: string; body: string } }>('CreatePost', `
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) { id title body }
  }`);

export const UPDATE_POST = operation<{ updatePost: Post }, { id: string; input: { title?: string; body?: string } }>('UpdatePost', `
  mutation UpdatePost($id: ID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) { id title body }
  }`);

export const DELETE_POST = operation<{ deletePost: boolean }, { id: string }>('DeletePost', `
  mutation DeletePost($id: ID!) {
    deletePost(id: $id)
  }`);
