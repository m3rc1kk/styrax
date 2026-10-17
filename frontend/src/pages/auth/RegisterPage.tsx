import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { safeNext } from "../../auth/RequireAuth";
import { Button } from "../../components/Button";
import { FormError, TextField } from "../../components/Field";
import { PageHead } from "../../components/PageHead";
import { describeError, fieldErrorsOf } from "../../lib/errors";
import { checkEmail, checkPassword, checkUsername, isValid, LIMITS, type Errors } from "../../lib/validation";
import { focusFirstInvalid } from "./LoginPage";
import styles from "./AuthForm.module.css";

type F = "email" | "username" | "password";

export function RegisterPage() {
  const { status, register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = safeNext(params.get("next"));

  const [values, setValues] = useState<Record<F, string>>({ email: "", username: "", password: "" });
  const [errors, setErrors] = useState<Errors<F>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (status === "authenticated" && !pending) return <Navigate to={next} replace />;

  const set = (field: F) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [field]: e.target.value }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const found: Errors<F> = {
      email: checkEmail(values.email),
      username: checkUsername(values.username),
      password: checkPassword(values.password),
    };
    setErrors(found);
    setFormError(null);
    if (!isValid(found)) return focusFirstInvalid(form);

    setPending(true);
    try {
      await register({ email: values.email.trim(), username: values.username, password: values.password });
      navigate(next, { replace: true });
    } catch (error) {
      setPending(false);
      if (error instanceof ApiError && error.status === 409) {
        const emailTaken = /email/i.test(error.detail ?? "");
        setErrors(
          emailTaken
            ? { email: "Этот email уже зарегистрирован. Войдите или укажите другой." }
            : { username: "Это имя уже занято. Придумайте другое." },
        );
        return focusFirstInvalid(form);
      }
      const fields = fieldErrorsOf(error);
      if (Object.keys(fields).length) {
        setErrors(fields as Errors<F>);
        return focusFirstInvalid(form);
      }
      setFormError(describeError(error));
    }
  }

  return (
    <div className={`${styles.page} stagger`}>
      <title>Регистрация · Styrax</title>
      <PageHead title="Регистрация" />
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="name@example.com"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
          hint="Нужен для входа. Никому не показывается."
        />
        <TextField
          label="Имя пользователя"
          name="username"
          autoComplete="username"
          spellCheck={false}
          autoCapitalize="none"
          maxLength={LIMITS.usernameMax}
          value={values.username}
          onChange={set("username")}
          error={errors.username}
          hint={`${LIMITS.usernameMin}–${LIMITS.usernameMax} символов: латинские буквы, цифры и _.`}
        />
        <TextField
          label="Пароль"
          name="password"
          type="password"
          autoComplete="new-password"
          maxLength={LIMITS.passwordMax}
          value={values.password}
          onChange={set("password")}
          error={errors.password}
          hint={`Не короче ${LIMITS.passwordMin} символов.`}
        />
        <FormError>{formError}</FormError>
        <Button type="submit" className={styles.submit} disabled={pending}>
          {pending ? "Создаём аккаунт…" : "Зарегистрироваться"}
        </Button>
      </form>
      <p className={styles.switch}>
        Уже есть аккаунт? <Link to={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}>Войдите</Link>
      </p>
    </div>
  );
}
