import type { RatingTarget } from "./types";

export const keys = {
  albums: ["albums"] as const,
  album: (id: number) => ["album", id] as const,
  artists: ["artists"] as const,
  artist: (id: number) => ["artist", id] as const,
  track: (id: number) => ["track", id] as const,
  stats: (target: RatingTarget, id: number) => ["rating", target, id, "stats"] as const,
  mine: (target: RatingTarget, id: number, userId: number | undefined) =>
    ["rating", target, id, "me", userId] as const,
  myRatings: (target: RatingTarget, userId: number | undefined) => ["my-ratings", target, userId] as const,
  isPersonal: (key: readonly unknown[]) => (key[0] === "rating" && key[3] === "me") || key[0] === "my-ratings",
};
