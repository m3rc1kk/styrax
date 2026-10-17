import { isApiError, request } from "./client";
import type {
  Album,
  AlbumDetail,
  AlbumInput,
  AlbumUpdateInput,
  Artist,
  ArtistInput,
  MyAlbumRatingItem,
  MyRating,
  MyTrackRatingItem,
  RatingStats,
  RatingTarget,
  RegisterInput,
  TokenResponse,
  Track,
  TrackDetail,
  TrackInput,
  User,
} from "./types";

type Page = { offset: number; limit: number };
const page = ({ offset, limit }: Page) => `offset=${offset}&limit=${limit}`;

export function login(email: string, password: string) {
  return request<TokenResponse>("/auth/login", {
    method: "POST",
    form: { username: email, password },
  });
}

export function register(data: RegisterInput) {
  return request<User>("/auth/register", { method: "POST", json: data });
}

export function logout() {
  return request<void>("/auth/logout", { method: "POST" });
}

export function getMe() {
  return request<User>("/auth/me");
}

export function listArtists(p: Page, signal?: AbortSignal) {
  return request<Artist[]>(`/artists?${page(p)}`, { signal });
}

export function getArtist(id: number, signal?: AbortSignal) {
  return request<Artist>(`/artists/${id}`, { signal });
}

export function createArtist(data: ArtistInput) {
  return request<Artist>("/artists", { method: "POST", json: data });
}

export function updateArtist(id: number, data: ArtistInput) {
  return request<Artist>(`/artists/${id}`, { method: "PATCH", json: data });
}

export function deleteArtist(id: number) {
  return request<void>(`/artists/${id}`, { method: "DELETE" });
}

export function listAlbums(p: Page, signal?: AbortSignal) {
  return request<Album[]>(`/albums?${page(p)}`, { signal });
}

export function getAlbum(id: number, signal?: AbortSignal) {
  return request<AlbumDetail>(`/albums/${id}`, { signal });
}

export function createAlbum(data: AlbumInput) {
  return request<Album>("/albums", { method: "POST", json: data });
}

export function updateAlbum(id: number, data: AlbumUpdateInput) {
  return request<Album>(`/albums/${id}`, { method: "PATCH", json: data });
}

export function deleteAlbum(id: number) {
  return request<void>(`/albums/${id}`, { method: "DELETE" });
}

export function getTrack(id: number, signal?: AbortSignal) {
  return request<TrackDetail>(`/tracks/${id}`, { signal });
}

export function createTrack(albumId: number, data: TrackInput) {
  return request<Track>(`/albums/${albumId}/tracks`, { method: "POST", json: data });
}

export function updateTrack(id: number, data: Partial<TrackInput>) {
  return request<TrackDetail>(`/tracks/${id}`, { method: "PATCH", json: data });
}

export function deleteTrack(id: number) {
  return request<void>(`/tracks/${id}`, { method: "DELETE" });
}

export function getRatingStats(target: RatingTarget, id: number, signal?: AbortSignal) {
  return request<RatingStats>(`/${target}/${id}/rating`, { signal });
}

export async function getMyRating(target: RatingTarget, id: number, signal?: AbortSignal) {
  try {
    return await request<MyRating>(`/${target}/${id}/rating/me`, { signal });
  } catch (error) {
    if (isApiError(error, 404)) return null;
    throw error;
  }
}

export function putMyRating(target: RatingTarget, id: number, rating: number) {
  return request<MyRating>(`/${target}/${id}/rating/me`, { method: "PUT", json: { rating } });
}

export function deleteMyRating(target: RatingTarget, id: number) {
  return request<void>(`/${target}/${id}/rating/me`, { method: "DELETE" });
}

export function listMyAlbumRatings(p: Page, signal?: AbortSignal) {
  return request<MyAlbumRatingItem[]>(`/me/ratings/albums?${page(p)}`, { signal });
}

export function listMyTrackRatings(p: Page, signal?: AbortSignal) {
  return request<MyTrackRatingItem[]>(`/me/ratings/tracks?${page(p)}`, { signal });
}
