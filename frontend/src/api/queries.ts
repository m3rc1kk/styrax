import {
  QueryClient,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from "@tanstack/react-query";
import { useAuth } from "../auth/AuthContext";
import { ApiError } from "./client";
import * as api from "./endpoints";
import { keys } from "./keys";
import type { AlbumInput, AlbumUpdateInput, ArtistInput, MyRating, RatingTarget, TrackInput } from "./types";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: (failureCount, error) =>
        !(error instanceof ApiError && error.status < 500) && failureCount < 2,
    },
  },
});

export const PAGE_SIZE = 24;

function usePagedList<T>(
  queryKey: QueryKey,
  load: (p: { offset: number; limit: number }, signal: AbortSignal) => Promise<T[]>,
  enabled = true,
) {
  const query = useInfiniteQuery({
    queryKey,
    enabled,
    initialPageParam: 0,
    queryFn: ({ pageParam, signal }) => load({ offset: pageParam, limit: PAGE_SIZE }, signal),
    getNextPageParam: (last, pages) => (last.length < PAGE_SIZE ? undefined : pages.length * PAGE_SIZE),
  });
  return { ...query, items: query.data?.pages.flat() ?? [] };
}

export function useAlbums() {
  return usePagedList(keys.albums, api.listAlbums);
}

export function useArtists() {
  return usePagedList(keys.artists, api.listArtists);
}

export function useArtistOptions() {
  return useQuery({
    queryKey: [...keys.artists, "options"],
    queryFn: ({ signal }) => api.listArtists({ offset: 0, limit: 100 }, signal),
  });
}

export function useArtist(id: number) {
  return useQuery({ queryKey: keys.artist(id), queryFn: ({ signal }) => api.getArtist(id, signal) });
}

export function useAlbum(id: number, enabled = true) {
  return useQuery({ queryKey: keys.album(id), queryFn: ({ signal }) => api.getAlbum(id, signal), enabled });
}

export function useTrack(id: number) {
  return useQuery({ queryKey: keys.track(id), queryFn: ({ signal }) => api.getTrack(id, signal) });
}

export function useRatingStats(target: RatingTarget, id: number) {
  return useQuery({
    queryKey: keys.stats(target, id),
    queryFn: ({ signal }) => api.getRatingStats(target, id, signal),
  });
}

export function useMyRating(target: RatingTarget, id: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: keys.mine(target, id, user?.id),
    queryFn: ({ signal }) => api.getMyRating(target, id, signal),
    enabled: Boolean(user),
  });
}

export function useMyAlbumRatings() {
  const { user } = useAuth();
  return usePagedList(keys.myRatings("albums", user?.id), api.listMyAlbumRatings, Boolean(user));
}

export function useMyTrackRatings() {
  const { user } = useAuth();
  return usePagedList(keys.myRatings("tracks", user?.id), api.listMyTrackRatings, Boolean(user));
}

export function useSetMyRating(target: RatingTarget, id: number) {
  const { user } = useAuth();
  const client = useQueryClient();
  const mineKey = keys.mine(target, id, user?.id);

  return useMutation({
    mutationFn: async (rating: number | null): Promise<MyRating | null> => {
      if (rating === null) {
        await api.deleteMyRating(target, id);
        return null;
      }
      return api.putMyRating(target, id, rating);
    },
    onMutate: async (rating) => {
      await client.cancelQueries({ queryKey: mineKey });
      const previous = client.getQueryData<MyRating | null>(mineKey);
      client.setQueryData<MyRating | null>(
        mineKey,
        rating === null ? null : { rating, updated_at: new Date().toISOString() },
      );
      return { previous };
    },
    onError: (_error, _rating, context) => {
      client.setQueryData(mineKey, context?.previous ?? null);
    },
    onSettled: () => {
      client.invalidateQueries({ queryKey: keys.stats(target, id) });
      client.invalidateQueries({ queryKey: mineKey });
      client.invalidateQueries({ queryKey: keys.myRatings(target, user?.id) });
    },
  });
}

export function useCreateArtist() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: ArtistInput) => api.createArtist(data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.artists }),
  });
}

export function useUpdateArtist(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: ArtistInput) => api.updateArtist(id, data),
    onSuccess: (artist) => {
      client.setQueryData(keys.artist(id), artist);
      client.invalidateQueries({ queryKey: keys.artists });
      client.invalidateQueries({ queryKey: keys.albums });
      client.invalidateQueries({ queryKey: ["album"] });
      client.invalidateQueries({ queryKey: ["track"] });
    },
  });
}

export function useDeleteArtist(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteArtist(id),
    onSuccess: () => {
      client.removeQueries({ queryKey: keys.artist(id) });
      client.invalidateQueries({ queryKey: keys.artists });
      client.invalidateQueries({ queryKey: keys.albums });
    },
  });
}

export function useCreateAlbum() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: AlbumInput) => api.createAlbum(data),
    onSuccess: () => client.invalidateQueries({ queryKey: keys.albums }),
  });
}

export function useUpdateAlbum(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: AlbumUpdateInput) => api.updateAlbum(id, data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: keys.album(id) });
      client.invalidateQueries({ queryKey: keys.albums });
      client.invalidateQueries({ queryKey: ["track"] });
    },
  });
}

export function useDeleteAlbum(id: number) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => api.deleteAlbum(id),
    onSuccess: () => {
      client.removeQueries({ queryKey: keys.album(id) });
      client.invalidateQueries({ queryKey: keys.albums });
    },
  });
}

function useTrackMutation<V>(albumId: number, fn: (vars: V) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: () => {
      client.invalidateQueries({ queryKey: keys.album(albumId) });
      client.invalidateQueries({ queryKey: ["track"] });
    },
  });
}

export function useCreateTrack(albumId: number) {
  return useTrackMutation(albumId, (data: TrackInput) => api.createTrack(albumId, data));
}

export function useUpdateTrack(albumId: number, trackId: number) {
  return useTrackMutation(albumId, (data: Partial<TrackInput>) => api.updateTrack(trackId, data));
}

export function useDeleteTrack(albumId: number, trackId: number) {
  return useTrackMutation(albumId, () => api.deleteTrack(trackId));
}
