import { Link } from "react-router";
import { useAlbums, useArtists } from "../../api/queries";
import { useAuth } from "../../auth/AuthContext";
import { AlbumCard } from "../../components/AlbumCard";
import { LoadError } from "../../components/LoadError";
import { LoadMore } from "../../components/LoadMore";
import { PageHead } from "../../components/PageHead";
import { Skeleton } from "../../components/Skeleton";
import styles from "./HomePage.module.css";

export function HomePage() {
  return (
    <div className={`${styles.page} stagger`}>
      <title>Styrax — каталог оценок музыки</title>
      <AlbumsSection />
      <ArtistsSection />
    </div>
  );
}

function AlbumsSection() {
  const albums = useAlbums();
  const { status } = useAuth();

  return (
    <section aria-labelledby="albums-title">
      <PageHead title={<span id="albums-title">Новые альбомы</span>} />

      {albums.isPending && (
        <div className={styles.grid} aria-busy="true">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <Skeleton variant="cover" />
              <Skeleton variant="text" />
            </div>
          ))}
        </div>
      )}

      {albums.isError && <LoadError title="Не удалось загрузить каталог" query={albums} />}

      {albums.isSuccess && albums.items.length === 0 && (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>В каталоге пока нет альбомов</p>
          <p>
            {status === "authenticated" ? (
              <Link to="/albums/new">Добавьте первый альбом</Link>
            ) : (
              <>
                <Link to="/register">Зарегистрируйтесь</Link>, чтобы добавить первый альбом.
              </>
            )}
          </p>
        </div>
      )}

      {albums.items.length > 0 && (
        <>
          <ul className={styles.grid}>
            {albums.items.map((album, i) => (
              <li key={album.id} className={styles.cell} style={{ animationDelay: `calc(var(--stagger) * ${i % 8})` }}>
                <AlbumCard album={album} />
              </li>
            ))}
          </ul>
          <LoadMore {...albums} />
        </>
      )}
    </section>
  );
}

function ArtistsSection() {
  const artists = useArtists();
  const { status } = useAuth();

  return (
    <section aria-labelledby="artists-title" className={styles.artists}>
      <div className={styles.sectionHead}>
        <h2 id="artists-title" className={styles.sectionTitle}>
          Исполнители
        </h2>
        {status === "authenticated" && (
          <Link to="/artists/new" className={styles.sectionLink}>
            Добавить исполнителя
          </Link>
        )}
      </div>

      {artists.isPending && <Skeleton variant="text" />}
      {artists.isError && <LoadError title="Не удалось загрузить исполнителей" query={artists} />}
      {artists.isSuccess && artists.items.length === 0 && (
        <p className={styles.muted}>Исполнителей пока нет.</p>
      )}
      {artists.items.length > 0 && (
        <>
          <ul className={styles.artistList}>
            {artists.items.map((artist) => (
              <li key={artist.id}>
                <Link to={`/artists/${artist.id}`} className={styles.artistLink}>
                  {artist.name}
                </Link>
              </li>
            ))}
          </ul>
          <LoadMore {...artists} />
        </>
      )}
    </section>
  );
}
