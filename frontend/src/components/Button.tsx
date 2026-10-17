import type { ComponentProps } from "react";
import { Link, type LinkProps } from "react-router";
import { cx } from "../lib/cx";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "text" | "danger";

type Props = ComponentProps<"button"> & {
  variant?: Variant;
};

export function Button({ variant = "primary", className, type = "button", ...rest }: Props) {
  return <button type={type} className={cx(styles.button, styles[variant], className)} {...rest} />;
}

export function ButtonLink({ variant = "secondary", className, ...rest }: LinkProps & { variant?: Variant }) {
  return <Link className={cx(styles.button, styles.link, styles[variant], className)} {...rest} />;
}
