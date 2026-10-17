import { useEffect, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router";
import { isApiError } from "../../api/client";
import { useAlbum, useArtistOptions, useCreateAlbum, useDeleteAlbum, useUpdateAlbum } from "../../api/queries";
import type { AlbumDetail, AlbumType } from "../../api/types";
import { Button, ButtonLink } from "../../components/Button";
import { ConfirmAction } from "../../components/ConfirmAction";
import { Cover } from "../../components/Cover";
import { ChoiceField, FormError, SelectField, TextField } from "../../components/Field";
import { LoadError } from "../../components/LoadError";
import { PageHead } from "../../components/PageHead";
import { Skeleton } from "../../components/Skeleton";
import { StatusBlock } from "../../components/StatusBlock";
import { fieldErrorsOf } from "../../lib/errors";
import { ALBUM_TYPE_LABEL } from "../../lib/format";
import { useIdParam } from "../../lib/useIdParam";
import { checkName, checkUrl, isValid, LIMITS, mergeErrors, type Errors } from "../../lib/validation";
import { focusFirstInvalid } from "../auth/LoginPage";
import { saveErrorText } from "./ArtistFormPage";
import { NEW_TITLE_ID, TracksEditor } from "./TracksEditor";
import styles from "./EditForm.module.css";
import formStyles from "./AlbumForm.module.css";

const TYPE_OPTIONS: { value: AlbumType; label: string }[] = [
  { value: "album", label: ALBUM_TYPE_LABEL.album },
  { value: "ep", label: ALBUM_TYPE_LABEL.ep },
  { value: "single", label: ALBUM_TYPE_LABEL.single },
];

type Values = { title: string; artistId: string; type: AlbumType; releaseDate: string; coverUrl: string };
type F = "title" | "artist_id" | "album_type" | "release_date" | "cover_url";

function validate(values: Values, needArtist: boolean): Errors<F> {
  return {
    title: checkName(values.title, "название"),
    artist_id: needArtist && !values.artistId ? "Выберите исполнителя." : undefined,
    cover_url: checkUrl(values.coverUrl),
  };
}

export function NewAlbumPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const create = useCreateAlbum();

  return (
    <div className={`${styles.page} stagger`}>
      <title>Новый альбом · Styrax</title>
      <PageHead title="Новый альбом" />
      <AlbumForm
        initial={{ title: "", artistId: params.get("artist") ?? "", type: "album", releaseDate: "", coverUrl: "" }}
        withArtist
        submitLabel="Добавить альбом"
        pendingLabel="Добавляем…"
        mutation={create}
        cancelTo="/"
        onSubmit={(v) =>
          create.mutate(
            {
              title: v.title.trim(),
              artist_id: Number(v.artistId),
              album_type: v.type,
              release_date: v.releaseDate || null,
              cover_url: v.coverUrl.trim() || null,
            },
            { onSuccess: (album) => navigate(`/albums/${album.id}/edit?created=1#tracks`) },
          )
        }
      />
    </div>
  );
}

export function EditAlbumPage() {
  const id = useIdParam(useParams().id);
  const album = useAlbum(id ?? 0, id !== null);

  if (id === null || (album.isError && isApiError(album.error, 404))) {
    return <StatusBlock code="404" title="Альбом не найден" />;
  }
  if (album.isPending) return <Skeleton variant="title" />;
  if (album.isError) return <LoadError title="Не удалось загрузить альбом" query={album} />;
  return <EditAlbum album={album.data} />;
}

function EditAlbum({ album }: { album: AlbumDetail }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const update = useUpdateAlbum(album.id);
  const remove = useDeleteAlbum(album.id);
  const justCreated = params.get("created") === "1";

  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(location.hash.slice(1));
    target?.scrollIntoView({ block: "start" });
    const title =
      location.hash === "#tracks"
        ? document.getElementById(NEW_TITLE_ID)
        : target?.querySelector<HTMLElement>('input[aria-label^="Название"]');
    title?.focus({ preventScroll: true });
  }, [location.hash]);

  return (
    <div className={`${styles.page} stagger`}>
      <title>{`Редактирование: ${album.title} · Styrax`}</title>
      <PageHead
        eyebrow={
          <>
            <Link to={`/artists/${album.artist.id}`}>{album.artist.name}</Link>
            <span aria-hidden="true">/</span>
            <Link to={`/albums/${album.id}`}>{album.title}</Link>
          </>
        }
        title="Редактирование альбома"
        actions={
          <ButtonLink to={`/albums/${album.id}`} variant="secondary">
            К альбому
          </ButtonLink>
        }
      />

      {justCreated && (
        <p className={styles.notice} role="status">
          Альбом добавлен. Теперь добавьте треки — ниже.
        </p>
      )}

      <section className={styles.section} aria-labelledby="about-title">
        <h2 id="about-title" className={styles.sectionTitle}>
          Об альбоме
        </h2>
        <AlbumForm
          initial={{
            title: album.title,
            artistId: String(album.artist.id),
            type: album.album_type,
            releaseDate: album.release_date ?? "",
            coverUrl: album.cover_url ?? "",
          }}
          seed={album.id}
          artistName={album.artist.name}
          submitLabel="Сохранить"
          pendingLabel="Сохраняем…"
          mutation={update}
          cancelTo={`/albums/${album.id}`}
          onSubmit={(v) =>
            update.mutate(
              {
                title: v.title.trim(),
                album_type: v.type,
                release_date: v.releaseDate || null,
                cover_url: v.coverUrl.trim() || null,
              },
              { onSuccess: () => navigate(`/albums/${album.id}`) },
            )
          }
        />
      </section>

      <section id="tracks" className={styles.section} aria-labelledby="tracks-title">
        <h2 id="tracks-title" className={styles.sectionTitle}>
          Треки
        </h2>
        <TracksEditor album={album} />
      </section>

      <section className={styles.danger} aria-labelledby="danger-title">
        <h2 id="danger-title" className={styles.dangerTitle}>
          Удаление
        </h2>
        <p className={styles.muted}>Вместе с альбомом удалятся его треки и все оценки к ним.</p>
        <ConfirmAction
          label="Удалить альбом"
          question={`Удалить «${album.title}» со всеми треками?`}
          confirmLabel="Да, удалить"
          pending={remove.isPending}
          onConfirm={() =>
            remove.mutate(undefined, { onSuccess: () => navigate(`/artists/${album.artist.id}`, { replace: true }) })
          }
        />
        {remove.isError && <FormError>{saveErrorText(remove.error)}</FormError>}
      </section>
    </div>
  );
}

type FormProps = {
  initial: Values;
  withArtist?: boolean;
  artistName?: string;
  seed?: number;
  submitLabel: string;
  pendingLabel: string;
  mutation: { isPending: boolean; error: unknown };
  cancelTo: string;
  onSubmit: (values: Values) => void;
};

function AlbumForm({ initial, withArtist, artistName, seed = 0, submitLabel, pendingLabel, mutation, cancelTo, onSubmit }: FormProps) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Errors<F>>({});
  const artists = useArtistOptions();

  const server = fieldErrorsOf(mutation.error) as Errors<F>;
  const shown = mergeErrors(server, errors);
  const hasServerFieldError = Object.keys(server).length > 0;

  const set = <K extends keyof Values>(key: K, value: Values[K]) => setValues((v) => ({ ...v, [key]: value }));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate(values, Boolean(withArtist));
    setErrors(found);
    if (!isValid(found)) return focusFirstInvalid(event.currentTarget);
    onSubmit(values);
  }

  const coverPreview = checkUrl(values.coverUrl) ? null : values.coverUrl.trim() || null;

  return (
    <form className={formStyles.layout} onSubmit={handleSubmit} noValidate>
      <div className={styles.form}>
        <TextField
          label="Название"
          name="title"
          autoComplete="off"
          maxLength={LIMITS.name}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          error={shown.title}
          hint={`До ${LIMITS.name} символов.`}
        />

        {withArtist ? (
          <div className={formStyles.artist}>
            <SelectField
              label="Исполнитель"
              name="artist_id"
              value={values.artistId}
              onChange={(e) => set("artistId", e.target.value)}
              error={shown.artist_id}
              disabled={artists.isPending}
            >
              <option value="">{artists.isPending ? "Загружаем…" : "Выберите исполнителя"}</option>
              {artists.data?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </SelectField>
            <p className={styles.muted}>
              Нет в списке? <Link to="/artists/new?then=album">Добавьте исполнителя</Link>
            </p>
          </div>
        ) : (
          <p className={styles.muted}>
            Исполнитель: <strong>{artistName}</strong>. Его нельзя поменять у существующего альбома.
          </p>
        )}

        <ChoiceField
          label="Тип релиза"
          name="album_type"
          value={values.type}
          options={TYPE_OPTIONS}
          onChange={(type) => set("type", type)}
          error={shown.album_type}
        />

        <TextField
          label="Дата выхода"
          name="release_date"
          type="date"
          value={values.releaseDate}
          onChange={(e) => set("releaseDate", e.target.value)}
          error={shown.release_date}
          hint="Необязательно. На странице показывается год."
        />

        <TextField
          label="Ссылка на обложку"
          name="cover_url"
          type="url"
          inputMode="url"
          autoComplete="off"
          spellCheck={false}
          placeholder="https://…"
          maxLength={LIMITS.coverUrl}
          value={values.coverUrl}
          onChange={(e) => set("coverUrl", e.target.value)}
          error={shown.cover_url}
          hint="Необязательно. Без обложки нарисуем пластинку."
        />

        {mutation.error != null && !hasServerFieldError && <FormError>{saveErrorText(mutation.error)}</FormError>}

        <div className={styles.buttons}>
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? pendingLabel : submitLabel}
          </Button>
          <ButtonLink to={cancelTo} variant="text">
            Отмена
          </ButtonLink>
        </div>
      </div>

      <figure className={formStyles.preview}>
        <Cover url={coverPreview} title={values.title || "?"} seed={seed} size="md" />
        <figcaption className={styles.muted}>Так будет выглядеть обложка</figcaption>
      </figure>
    </form>
  );
}
