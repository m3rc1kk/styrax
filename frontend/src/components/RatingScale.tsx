import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { cx } from "../lib/cx";
import styles from "./RatingScale.module.css";

const VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

type Props = {
  value: number | null;
  onSelect: (value: number) => void;
  label: string;
  size?: "lg" | "sm";
  disabled?: boolean;
  autoFocus?: boolean;
};

export function RatingScale({ value, onSelect, label, size = "lg", disabled = false, autoFocus = false }: Props) {
  const [preview, setPreview] = useState<number | null>(null);
  const [focusValue, setFocusValue] = useState(value ?? 1);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    setFocusValue(value ?? 1);
  }, [value]);

  useEffect(() => {
    if (autoFocus) buttons.current[(value ?? 1) - 1]?.focus();
  }, [autoFocus]);

  function moveFocus(next: number) {
    const clamped = Math.min(10, Math.max(1, next));
    setFocusValue(clamped);
    buttons.current[clamped - 1]?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = {
      ArrowRight: focusValue + 1,
      ArrowUp: focusValue + 1,
      ArrowLeft: focusValue - 1,
      ArrowDown: focusValue - 1,
      Home: 1,
      End: 10,
    };
    if (event.key in moves) {
      event.preventDefault();
      moveFocus(moves[event.key]);
    }
  }

  return (
    <div
      role="group"
      aria-label={label}
      className={cx(styles.scale, size === "sm" && styles.sm, disabled && styles.disabled)}
      onKeyDown={handleKeyDown}
      onMouseLeave={() => setPreview(null)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPreview(null);
      }}
    >
      {VALUES.map((n) => (
        <button
          key={n}
          ref={(node) => {
            buttons.current[n - 1] = node;
          }}
          type="button"
          className={styles.cell}
          tabIndex={n === focusValue ? 0 : -1}
          aria-pressed={n === value}
          aria-label={`${n} из 10`}
          disabled={disabled}
          data-filled={value !== null && n <= value}
          data-preview={preview !== null && n <= preview}
          style={{ "--i": n } as CSSProperties}
          onClick={() => onSelect(n)}
          onMouseEnter={() => setPreview(n)}
          onFocus={() => {
            setFocusValue(n);
            setPreview(n);
          }}
        >
          <span className={styles.digit}>{n}</span>
        </button>
      ))}
    </div>
  );
}
