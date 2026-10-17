import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { cx } from "../lib/cx";
import styles from "./Field.module.css";

type Common = { label: string; hint?: ReactNode; error?: string };

function useFieldIds(error?: string, hint?: ReactNode) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return { id, hintId, errorId, describedBy: [errorId, hintId].filter(Boolean).join(" ") || undefined };
}

function Wrapper({ id, label, hint, hintId, error, errorId, children }: Common & {
  id: string;
  hintId?: string;
  errorId?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {hint && !error && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextField({ label, hint, error, className, ...input }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const ids = useFieldIds(error, hint);
  return (
    <Wrapper id={ids.id} label={label} hint={hint} hintId={ids.hintId} error={error} errorId={ids.errorId}>
      <input
        id={ids.id}
        className={cx(styles.input, className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...input}
      />
    </Wrapper>
  );
}

export function SelectField({
  label,
  hint,
  error,
  children,
  ...select
}: Common & SelectHTMLAttributes<HTMLSelectElement>) {
  const ids = useFieldIds(error, hint);
  return (
    <Wrapper id={ids.id} label={label} hint={hint} hintId={ids.hintId} error={error} errorId={ids.errorId}>
      <select
        id={ids.id}
        className={cx(styles.input, styles.select)}
        aria-invalid={error ? true : undefined}
        aria-describedby={ids.describedBy}
        {...select}
      >
        {children}
      </select>
    </Wrapper>
  );
}

export function ChoiceField<T extends string>({
  label,
  name,
  value,
  options,
  onChange,
  error,
}: {
  label: string;
  name: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
  error?: string;
}) {
  return (
    <fieldset className={styles.field}>
      <legend className={styles.label}>{label}</legend>
      <div className={styles.choices}>
        {options.map((option) => (
          <label key={option.value} className={styles.choice}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </fieldset>
  );
}

export function FormError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p className={styles.formError} role="alert">
      {children}
    </p>
  );
}
