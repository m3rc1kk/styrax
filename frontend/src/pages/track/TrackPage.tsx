import { Link, useParams } from "react-router";
import { isApiError } from "../../api/client";
import { useAlbum, useTrack } from "../../api/queries";
import type { TrackDetail } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { ButtonLink } from "../../components/Button";
import { Cover } from "../../components/Cover";
import { LoadError } from "../../components/LoadError";
import { PageHead } from "../../components/PageHead";
import { MyRatingPanel } from "../../components/rating/MyRatingPanel";
import { RatingAverage } from "../../components/rating/RatingAverage";
import { Skeleton } from "../../components/Skeleton";
import { StatusBlock } from "../../components/StatusBlock";
import { cx } from "../../lib/cx";
import { formatDuration, formatTrackNumber, releaseYear } from "../../lib/format";
import { useIdParam } from "../../lib/useIdParam";
import styles from "./TrackPage.module.css";

export function TrackPage() {
  const id = useIdParam(useParams().id);
  if (id === null) return <TrackNotFound />;
  return <TrackView id={id} />;
}

function TrackView({ id }: { id: number }) {
  const track = useTrack(id);
  const { status } = useAuth();

  if (track.isPending) {
    return (
      <div aria-busy="true" className={styles.page}>
        <p className="visually-hidden" role="status">
          Загружаем трек…
        </p>
        <Skeleton variant="lead" />
        <Skeleton variant="title" />
        <Skeleton variant="scale" />
      </div>
    );
  }
  if (track.isError) {
    if (isApiError(track.error, 404)) return <TrackNotFound />;
    return <LoadError title="Не удалось загрузить трек" query={track} />;
  }

  const data = track.data;
  const { album } = data;
  const year = releaseYear(album.release_date);

  return (
    <article className={`${styles.page} stagger`}>
      <title>{`${data.title} — ${album.artist.name} · Styrax`}</title>

      <PageHead
        size="display"
        eyebrow={
          <>
            <Link to={`/artists/${album.artist.id}`}>{album.artist.name}</Link>
            <span className={styles.sep} aria-hidden="true">
              /
            </span>
            <Link to={`/albums/${album.id}`}>{album.title}</Link>
          </>
        }
        title={data.title}
        actions={
          status === "authenticated" && (
            <ButtonLink to={`/albums/${album.id}/edit#track-${data.id}`} variant="secondary">
              Редактировать
            </ButtonLink>
          )
        }
      />

      <div className={styles.body}>
        <div className={styles.grid}>
          <dl className={styles.facts}>
            <div className={styles.fact}>
              <dt>Номер</dt>
              <dd>{formatTrackNumber(data.track_number)}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Длительность</dt>
              <dd>{formatDuration(data.duration_sec) ?? "—"}</dd>
            </div>
            <div className={styles.fact}>
              <dt>Год</dt>
              <dd>{year ?? "—"}</dd>
            </div>
          </dl>
          <RatingAverage target="tracks" id={data.id} />
          <MyRatingPanel target="tracks" id={data.id} />
        </div>

        <AlbumTracks track={data} />
      </div>
    </article>
  );
}

function AlbumTracks({ track }: { track: TrackDetail }) {
  const album = useAlbum(track.album.id);

  return (
    <section className={styles.album} aria-labelledby="album-tracks">
      <div className={styles.albumHead}>
        <Link to={`/albums/${track.album.id}`} className={styles.albumCover} tabIndex={-1} aria-hidden="true">
          <Cover
            url={track.album.cover_url}
            title={track.album.title}
            seed={track.album.id}
            size="sm"
          />
        </Link>
        <div>
          <p className={styles.albumKind}>Из альбома</p>
          <h2 id="album-tracks" className={styles.albumTitle}>
            <Link to={`/albums/${track.album.id}`}>{track.album.title}</Link>
          </h2>
        </div>
      </div>

      {album.isPending && <Skeleton variant="text" />}
      {album.data && (
        <ol className={styles.list}>
          {album.data.tracks.map((t) => {
            const current = t.id === track.id;
            return (
              <li key={t.id} className={cx(styles.item, current && styles.current)}>
                <span className={styles.no}>{formatTrackNumber(t.track_number)}</span>
                {current ? (
                  <span aria-current="page">{t.title}</span>
                ) : (
                  <Link to={`/tracks/${t.id}`} className={styles.itemLink}>
                    {t.title}
                  </Link>
                )}
                <span className={styles.dur}>{formatDuration(t.duration_sec) ?? ""}</span>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function TrackNotFound() {
  return (
    <StatusBlock code="404" title="Трек не найден">
      <title>Трек не найден · Styrax</title>
      <p>
        Такого трека нет в каталоге. Возможно, его удалили. <Link to="/">Открыть каталог</Link>
      </p>
    </StatusBlock>
  );
}
