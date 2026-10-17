import type { ReactNode } from "react";
import { cx } from "../lib/cx";
import styles from "./PageHead.module.css";

type Props = {
  eyebrow?: ReactNode;
  title: ReactNode;
  size?: "display" | "section";
  actions?: ReactNode;
};

export function PageHead({ eyebrow, title, size = "section", actions }: Props) {
  return (
    <header className={styles.head}>
      {eyebrow && <div className={styles.eyebrow}>{eyebrow}</div>}
      <div className={styles.row}>
        <h1 className={cx(styles.title, styles[size])}>{title}</h1>
        {actions && <div className={styles.actions}>{actions}</div>}
      </div>
    </header>
  );
}
