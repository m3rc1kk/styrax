import { useRatingStats } from "../../api/queries";
import type { RatingTarget } from "../../api/types";
import { formatAverage, formatRatingsCount } from "../../lib/format";
import { Skeleton } from "../Skeleton";
import styles from "./Rating.module.css";

export function RatingAverage({ target, id }: { target: RatingTarget; id: number }) {
  const stats = useRatingStats(target, id);

  return (
    <section aria-labelledby={`average-${target}-${id}`}>
      <h2 id={`average-${target}-${id}`} className={styles.label}>
        Средняя оценка
      </h2>
      {stats.isPending && <Skeleton variant="score" />}
      {stats.isError && <p className={styles.muted}>Не удалось загрузить среднюю оценку.</p>}
      {stats.data &&
        (stats.data.average === null ? (
          <p className={styles.noScore}>Пока никто не оценил</p>
        ) : (
          <p className={styles.score}>
            <span key={stats.data.average} className={styles.scoreValue}>
              {formatAverage(stats.data.average)}
            </span>
            <span className={styles.scoreMeta}>/ 10 · {formatRatingsCount(stats.data.count)}</span>
          </p>
        ))}
    </section>
  );
}
