import { Link, useSearchParams } from "react-router";
import { useMyAlbumRatings, useMyTrackRatings } from "../../api/queries";
import { Cover } from "../../components/Cover";
import { LoadError } from "../../components/LoadError";
import { LoadMore } from "../../components/LoadMore";
import { PageHead } from "../../components/PageHead";
import { ScoreCell } from "../../components/rating/ScoreCell";
import { Skeleton } from "../../components/Skeleton";
import { formatDate, formatTrackNumber } from "../../lib/format";
import styles from "./MyRatingsPage.module.css";

type Tab = "albums" | "tracks";

const TABS: { value: Tab; label: string }[] = [
  { value: "albums", label: "Альбомы" },
  { value: "tracks", label: "Треки" },
];

export function MyRatingsPage() {
  const [params] = useSearchParams();
  const tab: Tab = params.get("tab") === "tracks" ? "tracks" : "albums";

  return (
    <div className={`${styles.page} stagger`}>
      <title>Мои оценки · Styrax</title>
      <PageHead title="Мои оценки" />
      <nav className={styles.tabs} aria-label="Что показать">
        {TABS.map((t) => (
          <Link
            key={t.value}
            to={t.value === "albums" ? "/me" : "/me?tab=tracks"}
            className={styles.tab}
            aria-current={tab === t.value ? "page" : undefined}
            replace
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "albums" ? <AlbumRatings /> : <TrackRatings />}
    </div>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy="true">
      <p className="visually-hidden" role="status">
        Загружаем оценки…
      </p>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className={styles.skeletonRow}>
          <Skeleton variant="text" />
        </div>
      ))}
    </div>
  );
}

function Empty({ what }: { what: string }) {
  return (
    <div className={styles.empty}>
      <p className={styles.emptyTitle}>Вы ещё не оценили ни одного {what}</p>
      <p>
        Оценку ставят на странице альбома или трека. Начните с <Link to="/">каталога</Link>.
      </p>
    </div>
  );
}

function AlbumRatings() {
  const list = useMyAlbumRatings();
  if (list.isPending) return <ListSkeleton />;
  if (list.isError) return <LoadError title="Не удалось загрузить оценки" query={list} />;
  if (list.items.length === 0) return <Empty what="альбома" />;

  return (
    <>
      <ul className={styles.list}>
        {list.items.map(({ album, rating, updated_at }) => (
          <li key={album.id} className={styles.row}>
            <Link to={`/albums/${album.id}`} className={styles.thumb} tabIndex={-1} aria-hidden="true">
              <Cover url={album.cover_url} title={album.title} seed={album.id} size="sm" />
            </Link>
            <div className={styles.main}>
              <Link to={`/albums/${album.id}`} className={styles.title}>
                {album.title}
              </Link>
              <span className={styles.sub}>{album.artist.name}</span>
            </div>
            <span className={styles.date}>{formatDate(updated_at)}</span>
            <ScoreCell value={rating} label={`моя оценка ${rating} из 10`} />
          </li>
        ))}
      </ul>
      <LoadMore {...list} />
    </>
  );
}

function TrackRatings() {
  const list = useMyTrackRatings();
  if (list.isPending) return <ListSkeleton />;
  if (list.isError) return <LoadError title="Не удалось загрузить оценки" query={list} />;
  if (list.items.length === 0) return <Empty what="трека" />;

  return (
    <>
      <ul className={styles.list}>
        {list.items.map(({ track, rating, updated_at }) => (
          <li key={track.id} className={styles.row}>
            <span className={styles.number} aria-hidden="true">
              {formatTrackNumber(track.track_number)}
            </span>
            <div className={styles.main}>
              <Link to={`/tracks/${track.id}`} className={styles.title}>
                {track.title}
              </Link>
              <span className={styles.sub}>
                {track.album.artist.name} · <Link to={`/albums/${track.album.id}`}>{track.album.title}</Link>
              </span>
            </div>
            <span className={styles.date}>{formatDate(updated_at)}</span>
            <ScoreCell value={rating} label={`моя оценка ${rating} из 10`} />
          </li>
        ))}
      </ul>
      <LoadMore {...list} />
    </>
  );
}
