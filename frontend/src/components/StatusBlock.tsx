import type { ReactNode } from "react";
import styles from "./StatusBlock.module.css";

type Props = { code?: string; title: string; children?: ReactNode; action?: ReactNode };

export function StatusBlock({ code, title, children, action }: Props) {
  return (
    <section className={styles.block} aria-labelledby="status-title">
      {code && <p className={styles.code}>{code}</p>}
      <h1 id="status-title" className={styles.title}>
        {title}
      </h1>
      {children && <div className={styles.text}>{children}</div>}
      {action && <div className={styles.action}>{action}</div>}
    </section>
  );
}
