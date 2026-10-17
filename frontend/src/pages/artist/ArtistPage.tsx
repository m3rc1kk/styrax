import { Link, useParams } from "react-router";
import { isApiError } from "../../api/client";
import { useArtist } from "../../api/queries";
import { useAuth } from "../../auth/AuthContext";
import { ButtonLink } from "../../components/Button";
import { LoadError } from "../../components/LoadError";
import { PageHead } from "../../components/PageHead";
import { Skeleton } from "../../components/Skeleton";
import { StatusBlock } from "../../components/StatusBlock";
import { useIdParam } from "../../lib/useIdParam";
import styles from "./ArtistPage.module.css";

export function ArtistPage() {
  const id = useIdParam(useParams().id);
  if (id === null) return <ArtistNotFound />;
  return <ArtistView id={id} />;
}

function ArtistView({ id }: { id: number }) {
  const artist = useArtist(id);
  const { status } = useAuth();

  if (artist.isPending) {
    return (
      <div aria-busy="true" className={styles.page}>
        <p className="visually-hidden" role="status">
          Загружаем исполнителя…
        </p>
        <Skeleton variant="lead" />
        <Skeleton variant="title" />
      </div>
    );
  }
  if (artist.isError) {
    if (isApiError(artist.error, 404)) return <ArtistNotFound />;
    return <LoadError title="Не удалось загрузить исполнителя" query={artist} />;
  }

  const data = artist.data;

  return (
    <div className={`${styles.page} stagger`}>
      <title>{`${data.name} · Styrax`}</title>
      <PageHead
        size="display"
        eyebrow={<span className={styles.kind}>Исполнитель</span>}
        title={data.name}
        actions={
          status === "authenticated" && (
            <ButtonLink to={`/artists/${data.id}/edit`} variant="secondary">
              Редактировать
            </ButtonLink>
          )
        }
      />

      <section className={styles.albums} aria-labelledby="artist-albums">
        <h2 id="artist-albums" className={styles.sectionTitle}>
          Альбомы
        </h2>
        <p className={styles.note}>
          Альбомы исполнителя ищите в <Link to="/">каталоге</Link>.
        </p>
        {status === "authenticated" && (
          <div>
            <ButtonLink to={`/albums/new?artist=${data.id}`} variant="primary">
              Добавить альбом исполнителя
            </ButtonLink>
          </div>
        )}
      </section>
    </div>
  );
}

function ArtistNotFound() {
  return (
    <StatusBlock code="404" title="Исполнитель не найден">
      <title>Исполнитель не найден · Styrax</title>
      <p>
        Такого исполнителя нет в каталоге. Возможно, его удалили. <Link to="/">Открыть каталог</Link>
      </p>
    </StatusBlock>
  );
}
