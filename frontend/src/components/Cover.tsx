import { useState } from "react";
import { cx } from "../lib/cx";
import styles from "./Cover.module.css";

type Size = "sm" | "md" | "lg";

type Props = {
  url: string | null;
  title: string;
  seed: number;
  size?: Size;
  animateIn?: boolean;
  className?: string;
};

const COVER_SIZE = 600;

export function Cover({ url, title, seed, size = "md", animateIn = false, className }: Props) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  if (url && url !== failedUrl) {
    return (
      <img
        className={cx(styles.cover, styles.image, loaded && styles.loaded, className)}
        src={url}
        alt={`Обложка альбома «${title}»`}
        width={COVER_SIZE}
        height={COVER_SIZE}
        loading={size === "lg" ? "eager" : "lazy"}
        fetchPriority={size === "lg" ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        onError={() => setFailedUrl(url)}
      />
    );
  }

  return (
    <div
      className={cx(styles.cover, styles.placeholder, animateIn && styles.appear, className)}
      role="img"
      aria-label={`Обложки нет: заглушка для альбома «${title}»`}
    >
      <Record size={size} />
      {size === "lg" && (
        <span className={styles.catalog} aria-hidden="true">
          STX-{String(seed).padStart(4, "0")}
        </span>
      )}
    </div>
  );
}

const CENTER = 50;
const DISC_R = 40;
const LABEL_R = 13;
const GROOVE_STEP: Record<Size, number> = { sm: 9, md: 4.5, lg: 3 };

function Record({ size }: { size: Size }) {
  const step = GROOVE_STEP[size];
  const grooves: number[] = [];
  for (let r = LABEL_R + step; r < DISC_R; r += step) grooves.push(r);

  return (
    <svg className={styles.svg} viewBox="0 0 100 100" aria-hidden="true">
      <circle className={styles.disc} cx={CENTER} cy={CENTER} r={DISC_R} />
      {grooves.map((r) => (
        <circle key={r} className={styles.groove} cx={CENTER} cy={CENTER} r={r} />
      ))}
      <circle className={styles.label} cx={CENTER} cy={CENTER} r={LABEL_R} />
      <circle className={styles.hole} cx={CENTER} cy={CENTER} r={1.2} />
    </svg>
  );
}
