import { cx } from "../../lib/cx";
import styles from "./Rating.module.css";

export function ScoreCell({ value, label, className }: { value: number; label?: string; className?: string }) {
  return (
    <span className={cx(styles.cell, className)} aria-label={label}>
      {value}
    </span>
  );
}
