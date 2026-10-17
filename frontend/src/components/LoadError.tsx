import { describeError } from "../lib/errors";
import { Button } from "./Button";
import { StatusBlock } from "./StatusBlock";

type Query = { error: unknown; refetch: () => unknown; isFetching: boolean };

export function LoadError({ title, query }: { title: string; query: Query }) {
  return (
    <StatusBlock
      title={title}
      action={
        <Button onClick={() => query.refetch()} disabled={query.isFetching}>
          {query.isFetching ? "Загружаем…" : "Повторить"}
        </Button>
      }
    >
      <p>{describeError(query.error)}</p>
    </StatusBlock>
  );
}
