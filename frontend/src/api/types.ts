export type User = { id: number; username: string; email: string };
export type Artist = { id: number; name: string };
export type AlbumType = "single" | "album" | "ep";

export type Album = {
  id: number;
  title: string;
  album_type: AlbumType;
  release_date: string | null;
  cover_url: string | null;
  artist: Artist;
};

export type Track = {
  id: number;
  album_id: number;
  title: string;
  track_number: number;
  duration_sec: number | null;
};

export type AlbumDetail = Album & { tracks: Track[] };
export type TrackDetail = Track & { album: Album };
export type RatingStats = { average: number | null; count: number };
export type MyRating = { rating: number; updated_at: string };
export type MyAlbumRatingItem = MyRating & { album: Album };
export type MyTrackRatingItem = MyRating & { track: TrackDetail };
export type TokenResponse = { access_token: string; token_type: string };

export type RatingTarget = "albums" | "tracks";

export type RegisterInput = { email: string; username: string; password: string };
export type ArtistInput = { name: string };
export type AlbumInput = {
  title: string;
  artist_id: number;
  album_type: AlbumType;
  release_date: string | null;
  cover_url: string | null;
};
export type AlbumUpdateInput = Partial<Omit<AlbumInput, "artist_id">>;
export type TrackInput = { title: string; track_number: number; duration_sec: number | null };
