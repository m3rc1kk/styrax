import { Link, useLocation } from "react-router";
import { useMyRating, useSetMyRating } from "../../api/queries";
import type { RatingTarget } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { loginPath } from "../../auth/RequireAuth";
import { describeError } from "../../lib/errors";
import { Button } from "../Button";
import { RatingScale } from "../RatingScale";
import { Skeleton } from "../Skeleton";
import styles from "./Rating.module.css";

const NOUN: Record<RatingTarget, { dative: string; accusative: string }> = {
  albums: { dative: "альбому", accusative: "альбом" },
  tracks: { dative: "треку", accusative: "трек" },
};

export function MyRatingPanel({ target, id }: { target: RatingTarget; id: number }) {
  const { status } = useAuth();
  const location = useLocation();
  const mine = useMyRating(target, id);
  const setRating = useSetMyRating(target, id);

  const value = mine.data?.rating ?? null;
  const loading = status === "loading" || (status === "authenticated" && mine.isPending);
  const label = `Моя оценка ${NOUN[target].dative}`;

  return (
    <section aria-labelledby={`mine-${target}-${id}`}>
      <h2 id={`mine-${target}-${id}`} className={styles.label}>
        Моя оценка
      </h2>

      {loading && <Skeleton variant="scale" />}

      {status === "guest" && (
        <div className={styles.rating}>
          <RatingScale value={null} onSelect={() => {}} label={label} disabled />
          <p className={styles.foot}>
            <span>
              Чтобы поставить оценку,{" "}
              <Link className={styles.link} to={loginPath(location.pathname)}>
                войдите
              </Link>
            </span>
          </p>
        </div>
      )}

      {status === "authenticated" && mine.isError && (
        <p className={styles.error} role="alert">
          {describeError(mine.error)}{" "}
          <Button variant="text" onClick={() => mine.refetch()}>
            Повторить
          </Button>
        </p>
      )}

      {status === "authenticated" && mine.isSuccess && (
        <div className={styles.rating}>
          <RatingScale value={value} onSelect={(n) => n !== value && setRating.mutate(n)} label={label} />
          <div className={styles.foot}>
            <span className={styles.readout} aria-live="polite">
              {value === null ? `Вы ещё не оценили ${NOUN[target].accusative}` : `${value} из 10`}
            </span>
            {value !== null && (
              <Button variant="text" onClick={() => setRating.mutate(null)}>
                Снять оценку
              </Button>
            )}
          </div>
          {setRating.isError && (
            <p className={styles.error} role="alert">
              Оценка не сохранилась. {describeError(setRating.error)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
