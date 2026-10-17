import { useEffect, useRef, useState } from "react";
import { Button } from "./Button";
import styles from "./ConfirmAction.module.css";

type Props = {
  label: string;
  question: string;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
};

export function ConfirmAction({ label, question, confirmLabel, pending, onConfirm }: Props) {
  const [asking, setAsking] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (asking) cancelRef.current?.focus();
  }, [asking]);

  if (!asking) {
    return (
      <Button variant="danger" onClick={() => setAsking(true)}>
        {label}
      </Button>
    );
  }

  return (
    <div className={styles.confirm} role="group" aria-label={question}>
      <p className={styles.question}>{question}</p>
      <div className={styles.actions}>
        <Button variant="danger" onClick={onConfirm} disabled={pending}>
          {pending ? "Удаляем…" : confirmLabel}
        </Button>
        <Button ref={cancelRef} variant="secondary" onClick={() => setAsking(false)} disabled={pending}>
          Отмена
        </Button>
      </div>
    </div>
  );
}
