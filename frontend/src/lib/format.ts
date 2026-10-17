import type { AlbumType } from "../api/types";

const averageFormat = new Intl.NumberFormat("ru-RU", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const countFormat = new Intl.NumberFormat("ru-RU");

export function formatAverage(value: number) {
  return averageFormat.format(value);
}

export function formatDuration(seconds: number | null) {
  if (seconds === null) return null;
  const minutes = Math.floor(seconds / 60);
  const rest = String(seconds % 60).padStart(2, "0");
  return `${minutes}:${rest}`;
}

export function formatTrackNumber(value: number) {
  return String(value).padStart(2, "0");
}

export function plural(n: number, [one, few, many]: [string, string, string]) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function formatRatingsCount(count: number) {
  return `${countFormat.format(count)} ${plural(count, ["оценка", "оценки", "оценок"])}`;
}

export const ALBUM_TYPE_LABEL: Record<AlbumType, string> = {
  album: "Альбом",
  ep: "EP",
  single: "Сингл",
};

export function releaseYear(date: string | null) {
  return date ? date.slice(0, 4) : null;
}

const dateFormat = new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", year: "numeric" });

export function formatDate(iso: string) {
  return dateFormat.format(new Date(iso));
}
