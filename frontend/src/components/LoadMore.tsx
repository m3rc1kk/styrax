import { Button } from "./Button";
import styles from "./LoadMore.module.css";

type Props = {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => unknown;
};

export function LoadMore({ hasNextPage, isFetchingNextPage, fetchNextPage }: Props) {
  if (!hasNextPage) return null;
  return (
    <div className={styles.more}>
      <Button variant="secondary" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
        {isFetchingNextPage ? "Загружаем…" : "Показать ещё"}
      </Button>
    </div>
  );
}
