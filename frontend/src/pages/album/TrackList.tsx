import { useId, useRef, useState } from "react";
import { Link } from "react-router";
import { useMyRating, useRatingStats, useSetMyRating } from "../../api/queries";
import type { Track } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { Button } from "../../components/Button";
import { RatingScale } from "../../components/RatingScale";
import { Skeleton } from "../../components/Skeleton";
import { cx } from "../../lib/cx";
import { describeError } from "../../lib/errors";
import { formatAverage, formatDuration, formatTrackNumber } from "../../lib/format";
import styles from "./TrackList.module.css";

export function TrackList({ tracks }: { tracks: Track[] }) {
  const { status } = useAuth();
  const showMine = status === "authenticated";
  const columns = showMine ? 5 : 4;

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          <th scope="col" className={styles.colNo}>
            №
          </th>
          <th scope="col" className={styles.colTitle}>
            Название
          </th>
          <th scope="col" className={styles.colNum}>
            <span aria-hidden="true">Ср.</span>
            <span className="visually-hidden">Средняя оценка</span>
          </th>
          {showMine && (
            <th scope="col" className={styles.colMine}>
              <span aria-hidden="true">Моя</span>
              <span className="visually-hidden">Моя оценка</span>
            </th>
          )}
          <th scope="col" className={styles.colNum}>
            Время
          </th>
        </tr>
      </thead>
      <tbody>
        {tracks.map((track) => (
          <TrackRow key={track.id} track={track} showMine={showMine} columns={columns} />
        ))}
      </tbody>
    </table>
  );
}

function TrackRow({ track, showMine, columns }: { track: Track; showMine: boolean; columns: number }) {
  const stats = useRatingStats("tracks", track.id);
  const mine = useMyRating("tracks", track.id);
  const setRating = useSetMyRating("tracks", track.id);
  const [open, setOpen] = useState(false);
  const pickerId = useId();
  const toggle = useRef<HTMLButtonElement>(null);

  const value = mine.data?.rating ?? null;
  const duration = formatDuration(track.duration_sec);

  function close() {
    setOpen(false);
    toggle.current?.focus();
  }

  function choose(n: number | null) {
    setRating.mutate(n, { onError: () => setOpen(true) });
    close();
  }

  return (
    <>
      <tr className={cx(styles.row, open && styles.rowOpen)}>
        <td className={styles.no}>{formatTrackNumber(track.track_number)}</td>
        <th scope="row" className={styles.title}>
          <Link to={`/tracks/${track.id}`} className={styles.titleLink}>
            {track.title}
          </Link>
        </th>
        <td className={styles.num}>
          {stats.isPending ? (
            <Skeleton variant="textShort" />
          ) : stats.data?.average != null ? (
            formatAverage(stats.data.average)
          ) : (
            <NoValue label="нет оценок" />
          )}
        </td>
        {showMine && (
          <td className={styles.mine}>
            {mine.isPending ? (
              <Skeleton variant="cell" />
            ) : (
              <button
                ref={toggle}
                type="button"
                className={cx(styles.mineButton, value !== null && styles.mineSet)}
                aria-expanded={open}
                aria-controls={pickerId}
                aria-label={
                  value === null
                    ? `Оценить трек «${track.title}»`
                    : `Моя оценка треку «${track.title}»: ${value} из 10. Изменить`
                }
                onClick={() => setOpen((v) => !v)}
              >
                {value ?? "—"}
              </button>
            )}
          </td>
        )}
        <td className={styles.num}>
          {duration ?? <NoValue label="длительность не указана" />}
        </td>
      </tr>

      {showMine && (
        <tr className={styles.pickerRow} hidden={!open}>
          <td colSpan={columns} id={pickerId}>
            {open && (
              <div
                className={styles.picker}
                onKeyDown={(event) => {
                  if (event.key === "Escape") close();
                }}
              >
                <RatingScale
                  value={value}
                  onSelect={(n) => (n === value ? close() : choose(n))}
                  label={`Моя оценка треку «${track.title}»`}
                  size="sm"
                  autoFocus
                />
                <div className={styles.pickerFoot}>
                  {value !== null && (
                    <Button variant="text" onClick={() => choose(null)}>
                      Снять оценку
                    </Button>
                  )}
                  <Button variant="text" onClick={close}>
                    Закрыть
                  </Button>
                </div>
                {setRating.isError && (
                  <p className={styles.error} role="alert">
                    Оценка не сохранилась. {describeError(setRating.error)}
                  </p>
                )}
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

function NoValue({ label }: { label: string }) {
  return (
    <>
      <span className={styles.none} aria-hidden="true">
        —
      </span>
      <span className="visually-hidden">{label}</span>
    </>
  );
}
