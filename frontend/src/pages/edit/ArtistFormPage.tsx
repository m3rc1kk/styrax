import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router";
import { isApiError } from "../../api/client";
import { useArtist, useCreateArtist, useDeleteArtist, useUpdateArtist } from "../../api/queries";
import type { Artist } from "../../api/types";
import { Button, ButtonLink } from "../../components/Button";
import { ConfirmAction } from "../../components/ConfirmAction";
import { FormError, TextField } from "../../components/Field";
import { LoadError } from "../../components/LoadError";
import { PageHead } from "../../components/PageHead";
import { Skeleton } from "../../components/Skeleton";
import { StatusBlock } from "../../components/StatusBlock";
import { describeError, fieldErrorsOf, NOT_OWNER } from "../../lib/errors";
import { checkName, LIMITS } from "../../lib/validation";
import { useIdParam } from "../../lib/useIdParam";
import { focusFirstInvalid } from "../auth/LoginPage";
import styles from "./EditForm.module.css";

export function saveErrorText(error: unknown) {
  return isApiError(error, 403) ? NOT_OWNER : describeError(error);
}

export function NewArtistPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const backToAlbum = params.get("then") === "album";
  const create = useCreateArtist();

  return (
    <div className={`${styles.page} stagger`}>
      <title>Новый исполнитель · Styrax</title>
      <PageHead title="Новый исполнитель" />
      <ArtistForm
        initialName=""
        submitLabel="Добавить исполнителя"
        pendingLabel="Добавляем…"
        mutation={create}
        onSubmit={(name) =>
          create.mutate(
            { name },
            {
              onSuccess: (artist) =>
                navigate(backToAlbum ? `/albums/new?artist=${artist.id}` : `/artists/${artist.id}`),
            },
          )
        }
        cancelTo={backToAlbum ? "/albums/new" : "/"}
      />
    </div>
  );
}

export function EditArtistPage() {
  const id = useIdParam(useParams().id);
  const artist = useArtist(id ?? 0);

  if (id === null || (artist.isError && isApiError(artist.error, 404))) {
    return <StatusBlock code="404" title="Исполнитель не найден" />;
  }
  if (artist.isPending) return <Skeleton variant="title" />;
  if (artist.isError) return <LoadError title="Не удалось загрузить исполнителя" query={artist} />;
  return <EditArtist artist={artist.data} />;
}

function EditArtist({ artist }: { artist: Artist }) {
  const navigate = useNavigate();
  const update = useUpdateArtist(artist.id);
  const remove = useDeleteArtist(artist.id);

  return (
    <div className={`${styles.page} stagger`}>
      <title>{`Редактирование: ${artist.name} · Styrax`}</title>
      <PageHead
        eyebrow={<Link to={`/artists/${artist.id}`}>{artist.name}</Link>}
        title="Редактирование исполнителя"
      />
      <ArtistForm
        initialName={artist.name}
        submitLabel="Сохранить"
        pendingLabel="Сохраняем…"
        mutation={update}
        onSubmit={(name) => update.mutate({ name }, { onSuccess: () => navigate(`/artists/${artist.id}`) })}
        cancelTo={`/artists/${artist.id}`}
      />

      <section className={styles.danger} aria-labelledby="danger-title">
        <h2 id="danger-title" className={styles.dangerTitle}>
          Удаление
        </h2>
        <p className={styles.muted}>Вместе с исполнителем удалятся все его альбомы, треки и оценки к ним.</p>
        <ConfirmAction
          label="Удалить исполнителя"
          question={`Удалить «${artist.name}» со всеми альбомами?`}
          confirmLabel="Да, удалить"
          pending={remove.isPending}
          onConfirm={() => remove.mutate(undefined, { onSuccess: () => navigate("/", { replace: true }) })}
        />
        {remove.isError && <FormError>{saveErrorText(remove.error)}</FormError>}
      </section>
    </div>
  );
}

type MutationState = { isPending: boolean; error: unknown };

function ArtistForm({
  initialName,
  submitLabel,
  pendingLabel,
  mutation,
  onSubmit,
  cancelTo,
}: {
  initialName: string;
  submitLabel: string;
  pendingLabel: string;
  mutation: MutationState;
  onSubmit: (name: string) => void;
  cancelTo: string;
}) {
  const [name, setName] = useState(initialName);
  const [error, setError] = useState<string | undefined>();

  const serverField = fieldErrorsOf(mutation.error).name;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = checkName(name, "имя исполнителя");
    setError(found);
    if (found) return focusFirstInvalid(event.currentTarget);
    onSubmit(name.trim());
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <TextField
        label="Имя исполнителя"
        name="name"
        autoComplete="off"
        maxLength={LIMITS.name}
        value={name}
        onChange={(e) => setName(e.target.value)}
        error={error ?? serverField}
        hint={`До ${LIMITS.name} символов.`}
      />
      {mutation.error != null && !serverField && <FormError>{saveErrorText(mutation.error)}</FormError>}
      <div className={styles.buttons}>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? pendingLabel : submitLabel}
        </Button>
        <ButtonLink to={cancelTo} variant="text">
          Отмена
        </ButtonLink>
      </div>
    </form>
  );
}
