import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { isApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { safeNext } from "../../auth/RequireAuth";
import { Button } from "../../components/Button";
import { FormError, TextField } from "../../components/Field";
import { PageHead } from "../../components/PageHead";
import { describeError } from "../../lib/errors";
import { checkEmail, isValid, type Errors } from "../../lib/validation";
import styles from "./AuthForm.module.css";

type F = "email" | "password";

export function LoginPage() {
  const { status, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors<F>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (status === "authenticated" && !pending) return <Navigate to={next} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found: Errors<F> = {
      email: checkEmail(email),
      password: password ? undefined : "Введите пароль.",
    };
    setErrors(found);
    setFormError(null);
    if (!isValid(found)) {
      focusFirstInvalid(event.currentTarget);
      return;
    }

    setPending(true);
    try {
      await login(email.trim(), password);
      navigate(next, { replace: true });
    } catch (error) {
      setFormError(
        isApiError(error, 401) ? "Неверный email или пароль. Проверьте раскладку и Caps Lock." : describeError(error),
      );
      setPending(false);
    }
  }

  return (
    <div className={`${styles.page} stagger`}>
      <title>Вход · Styrax</title>
      <PageHead title="Вход" />
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />
        <FormError>{formError}</FormError>
        <Button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Входим…" : "Войти"}
        </Button>
      </form>
      <p className={styles.switch}>
        Нет аккаунта? <Link to={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}>Зарегистрируйтесь</Link>
      </p>
    </div>
  );
}

export function focusFirstInvalid(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}
