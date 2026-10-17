import { cx } from "../lib/cx";
import styles from "./Skeleton.module.css";

type Variant = "text" | "textShort" | "lead" | "title" | "number" | "score" | "scale" | "cover" | "cell";

export function Skeleton({ variant, className }: { variant: Variant; className?: string }) {
  return <span className={cx(styles.skeleton, styles[variant], className)} aria-hidden="true" />;
}
