import { Link } from "react-router";
import { useRatingStats } from "../api/queries";
import type { Album } from "../api/types";
import { formatAverage, releaseYear } from "../lib/format";
import { Cover } from "./Cover";
import { Skeleton } from "./Skeleton";
import styles from "./AlbumCard.module.css";

export function AlbumCard({ album }: { album: Album }) {
  const stats = useRatingStats("albums", album.id);
  const year = releaseYear(album.release_date);

  return (
    <article className={styles.card}>
      <Link to={`/albums/${album.id}`} className={styles.coverLink} tabIndex={-1} aria-hidden="true">
        <Cover url={album.cover_url} title={album.title} seed={album.id} />
      </Link>
      <div className={styles.meta}>
        <h3 className={styles.title}>
          <Link to={`/albums/${album.id}`} className={styles.titleLink}>
            {album.title}
          </Link>
        </h3>
        <span className={styles.score}>
          {stats.isPending ? (
            <Skeleton variant="textShort" />
          ) : stats.data?.average != null ? (
            <>
              <span className="visually-hidden">средняя оценка </span>
              {formatAverage(stats.data.average)}
            </>
          ) : null}
        </span>
      </div>
      <p className={styles.sub}>
        <Link to={`/artists/${album.artist.id}`} className={styles.artist}>
          {album.artist.name}
        </Link>
        {year && <span className={styles.year}>{year}</span>}
      </p>
    </article>
  );
}
