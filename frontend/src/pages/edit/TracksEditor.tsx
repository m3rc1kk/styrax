import { useEffect, useState, type FormEvent } from "react";
import { isApiError } from "../../api/client";
import { useCreateTrack, useDeleteTrack, useUpdateTrack } from "../../api/queries";
import type { AlbumDetail, Track } from "../../api/types";
import { Button } from "../../components/Button";
import { cx } from "../../lib/cx";
import { fieldErrorsOf } from "../../lib/errors";
import { formatDuration } from "../../lib/format";
import { checkName, LIMITS, mergeErrors, parseDuration, type Errors } from "../../lib/validation";
import { saveErrorText } from "./ArtistFormPage";
import styles from "./TracksEditor.module.css";

type F = "track_number" | "title" | "duration_sec";

export const NEW_TITLE_ID = "new-track-title";
type Draft = { number: string; title: string; duration: string };

function checkDraft(d: Draft): Errors<F> {
  const n = Number(d.number);
  return {
    track_number: Number.isInteger(n) && n > 0 ? undefined : "Целое число больше 0.",
    title: checkName(d.title, "название"),
    duration_sec: parseDuration(d.duration) === undefined ? "Формат м:сс, например 4:05." : undefined,
  };
}

function serverErrors(error: unknown): Errors<F> {
  if (isApiError(error, 409)) return { track_number: "Этот номер уже занят в альбоме." };
  return fieldErrorsOf(error) as Errors<F>;
}

function toInput(d: Draft) {
  return { track_number: Number(d.number), title: d.title.trim(), duration_sec: parseDuration(d.duration) ?? null };
}

export function TracksEditor({ album }: { album: AlbumDetail }) {
  const nextNumber = album.tracks.reduce((max, t) => Math.max(max, t.track_number), 0) + 1;
  const [added, setAdded] = useState(false);

  return (
    <div className={styles.editor}>
      <div className={cx(styles.row, styles.head)} aria-hidden="true">
        <span>№</span>
        <span>Название</span>
        <span>Длительность</span>
        <span className={styles.actions} />
      </div>
      {album.tracks.length === 0 && <p className={styles.empty}>Треков пока нет. Добавьте первый.</p>}
      <ul className={styles.list}>
        {album.tracks.map((track) => (
          <li key={track.id} id={`track-${track.id}`} className={styles.item}>
            <TrackRow albumId={album.id} track={track} />
          </li>
        ))}
      </ul>
      <NewTrack key={nextNumber} albumId={album.id} nextNumber={nextNumber} focusTitle={added} onAdded={() => setAdded(true)} />
    </div>
  );
}

function TrackInputs({
  draft,
  onChange,
  errors,
  labelSuffix,
  titleId,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  errors: Errors<F>;
  labelSuffix: string;
  titleId?: string;
}) {
  const field = (key: keyof Draft) => ({
    value: draft[key],
    onChange: (e: { target: { value: string } }) => onChange({ ...draft, [key]: e.target.value }),
  });
  return (
    <>
      <input
        className={cx(styles.input, styles.number)}
        type="number"
        min={1}
        inputMode="numeric"
        aria-label={`Номер ${labelSuffix}`}
        aria-invalid={errors.track_number ? true : undefined}
        {...field("number")}
      />
      <input
        id={titleId}
        className={styles.input}
        maxLength={LIMITS.name}
        autoComplete="off"
        aria-label={`Название ${labelSuffix}`}
        aria-invalid={errors.title ? true : undefined}
        placeholder="Название трека"
        {...field("title")}
      />
      <input
        className={cx(styles.input, styles.duration)}
        inputMode="numeric"
        autoComplete="off"
        placeholder="м:сс"
        aria-label={`Длительность ${labelSuffix}, минуты и секунды`}
        aria-invalid={errors.duration_sec ? true : undefined}
        {...field("duration")}
      />
    </>
  );
}

function Problems({ errors, extra }: { errors: Errors<F>; extra?: string | null }) {
  const list = [errors.track_number && `Номер: ${errors.track_number}`, errors.title, errors.duration_sec, extra].filter(
    Boolean,
  );
  if (!list.length) return null;
  return (
    <p className={styles.error} role="alert">
      {list.join(" ")}
    </p>
  );
}

function TrackRow({ albumId, track }: { albumId: number; track: Track }) {
  const initial: Draft = {
    number: String(track.track_number),
    title: track.title,
    duration: formatDuration(track.duration_sec) ?? "",
  };
  const [draft, setDraft] = useState(initial);
  const [errors, setErrors] = useState<Errors<F>>({});
  const [confirming, setConfirming] = useState(false);
  const update = useUpdateTrack(albumId, track.id);
  const remove = useDeleteTrack(albumId, track.id);

  const dirty = draft.number !== initial.number || draft.title !== initial.title || draft.duration !== initial.duration;
  const label = `трека «${track.title}»`;

  function save(event: FormEvent) {
    event.preventDefault();
    const found = checkDraft(draft);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    update.mutate(toInput(draft), { onSuccess: () => setErrors({}) });
  }

  const shown = mergeErrors(serverErrors(update.error), errors);
  const other = update.error && !Object.keys(serverErrors(update.error)).length ? saveErrorText(update.error) : null;

  return (
    <form className={styles.row} onSubmit={save} noValidate aria-label={`Трек ${track.track_number}`}>
      <TrackInputs draft={draft} onChange={setDraft} errors={shown} labelSuffix={label} />
      <div className={styles.actions}>
        {confirming ? (
          <>
            <Button variant="danger" className={styles.small} disabled={remove.isPending} onClick={() => remove.mutate()}>
              {remove.isPending ? "Удаляем…" : "Удалить"}
            </Button>
            <Button variant="text" onClick={() => setConfirming(false)}>
              Отмена
            </Button>
          </>
        ) : (
          <>
            <Button type="submit" variant="secondary" className={styles.small} disabled={!dirty || update.isPending}>
              {update.isPending ? "Сохраняем…" : update.isSuccess && !dirty ? "Сохранено" : "Сохранить"}
            </Button>
            <Button variant="text" onClick={() => setConfirming(true)} aria-label={`Удалить ${label}`}>
              Удалить
            </Button>
          </>
        )}
      </div>
      <Problems errors={shown} extra={other ?? (remove.isError ? saveErrorText(remove.error) : null)} />
    </form>
  );
}

function NewTrack({
  albumId,
  nextNumber,
  focusTitle,
  onAdded,
}: {
  albumId: number;
  nextNumber: number;
  focusTitle: boolean;
  onAdded: () => void;
}) {
  const [draft, setDraft] = useState<Draft>({ number: String(nextNumber), title: "", duration: "" });
  const [errors, setErrors] = useState<Errors<F>>({});
  const create = useCreateTrack(albumId);

  useEffect(() => {
    if (focusTitle) document.getElementById(NEW_TITLE_ID)?.focus();
  }, [focusTitle]);

  function add(event: FormEvent) {
    event.preventDefault();
    const found = checkDraft(draft);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    create.mutate(toInput(draft), { onSuccess: onAdded });
  }

  const shown = mergeErrors(serverErrors(create.error), errors);
  const other = create.error && !Object.keys(serverErrors(create.error)).length ? saveErrorText(create.error) : null;

  return (
    <form className={cx(styles.row, styles.new)} onSubmit={add} noValidate aria-label="Новый трек">
      <TrackInputs draft={draft} onChange={setDraft} errors={shown} labelSuffix="нового трека" titleId={NEW_TITLE_ID} />
      <div className={styles.actions}>
        <Button type="submit" className={styles.small} disabled={create.isPending}>
          {create.isPending ? "Добавляем…" : "Добавить трек"}
        </Button>
      </div>
      <Problems errors={shown} extra={other} />
    </form>
  );
}
