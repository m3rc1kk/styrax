import { Link, useParams } from "react-router";
import { isApiError } from "../../api/client";
import { useAlbum } from "../../api/queries";
import { useAuth } from "../../auth/AuthContext";
import { ButtonLink } from "../../components/Button";
import { Cover } from "../../components/Cover";
import { LoadError } from "../../components/LoadError";
import { PageHead } from "../../components/PageHead";
import { MyRatingPanel } from "../../components/rating/MyRatingPanel";
import { RatingAverage } from "../../components/rating/RatingAverage";
import { Skeleton } from "../../components/Skeleton";
import { StatusBlock } from "../../components/StatusBlock";
import { ALBUM_TYPE_LABEL, releaseYear } from "../../lib/format";
import { useIdParam } from "../../lib/useIdParam";
import { TrackList } from "./TrackList";
import styles from "./AlbumPage.module.css";

export function AlbumPage() {
  const id = useIdParam(useParams().id);
  if (id === null) return <AlbumNotFound />;
  return <AlbumView id={id} />;
}

function AlbumView({ id }: { id: number }) {
  const album = useAlbum(id);
  const { status } = useAuth();

  if (album.isPending) return <AlbumSkeleton />;
  if (album.isError) {
    if (isApiError(album.error, 404)) return <AlbumNotFound />;
    return <LoadError title="Не удалось загрузить альбом" query={album} />;
  }

  const data = album.data;
  const year = releaseYear(data.release_date);

  return (
    <article className={`${styles.page} stagger`}>
      <title>{`${data.title} — ${data.artist.name} · Styrax`}</title>

      <PageHead
        size="display"
        eyebrow={<Link to={`/artists/${data.artist.id}`}>{data.artist.name}</Link>}
        title={data.title}
        actions={
          status === "authenticated" && (
            <ButtonLink to={`/albums/${data.id}/edit`} variant="secondary">
              Редактировать
            </ButtonLink>
          )
        }
      />

      <div className={styles.grid}>
        <div className={styles.cover}>
          <Cover url={data.cover_url} title={data.title} seed={data.id} size="lg" animateIn />
        </div>

        <dl className={styles.facts}>
          <div className={styles.fact}>
            <dt>Тип</dt>
            <dd>{ALBUM_TYPE_LABEL[data.album_type]}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Год</dt>
            <dd>{year ?? "—"}</dd>
          </div>
          <div className={styles.fact}>
            <dt>Треков</dt>
            <dd>{data.tracks.length}</dd>
          </div>
        </dl>

        <div className={styles.average}>
          <RatingAverage target="albums" id={data.id} />
        </div>
        <div className={styles.mine}>
          <MyRatingPanel target="albums" id={data.id} />
        </div>
      </div>

      <section className={styles.tracks} aria-labelledby="tracks-title">
        <h2 id="tracks-title" className="visually-hidden">
          Треки
        </h2>
        {data.tracks.length > 0 ? (
          <TrackList tracks={data.tracks} />
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>В альбоме пока нет треков</p>
            {status === "authenticated" ? (
              <p>
                Добавьте их на странице{" "}
                <Link to={`/albums/${data.id}/edit#tracks`}>редактирования альбома</Link>.
              </p>
            ) : (
              <p>Треки добавляет тот, кто создал альбом в каталоге.</p>
            )}
          </div>
        )}
      </section>
    </article>
  );
}

function AlbumNotFound() {
  return (
    <StatusBlock code="404" title="Альбом не найден">
      <title>Альбом не найден · Styrax</title>
      <p>
        Такого альбома нет в каталоге. Возможно, его удалили или в ссылке ошибка. <Link to="/">Открыть каталог</Link>
      </p>
    </StatusBlock>
  );
}

function AlbumSkeleton() {
  return (
    <div className={styles.page} aria-busy="true">
      <p className="visually-hidden" role="status">
        Загружаем альбом…
      </p>
      <div className={styles.skeletonHead}>
        <Skeleton variant="lead" />
        <Skeleton variant="title" />
      </div>
      <div className={styles.grid}>
        <div className={styles.cover}>
          <Skeleton variant="cover" />
        </div>
        <div className={styles.facts}>
          {[0, 1, 2].map((i) => (
            <div key={i} className={styles.fact}>
              <Skeleton variant="number" />
            </div>
          ))}
        </div>
        <div className={styles.average}>
          <Skeleton variant="score" />
        </div>
        <div className={styles.mine}>
          <Skeleton variant="scale" />
        </div>
      </div>
      <div className={styles.tracks}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className={styles.skeletonRow}>
            <Skeleton variant="text" />
          </div>
        ))}
      </div>
    </div>
  );
}
