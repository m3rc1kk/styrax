export const LIMITS = {
  name: 50,
  coverUrl: 512,
  usernameMin: 3,
  usernameMax: 30,
  passwordMin: 8,
  passwordMax: 128,
};

export type Errors<F extends string> = Partial<Record<F, string>>;

export function checkName(value: string, label: string) {
  const v = value.trim();
  if (!v) return `Введите ${label}.`;
  if (v.length > LIMITS.name) return `Не длиннее ${LIMITS.name} символов (сейчас ${v.length}).`;
  return undefined;
}

export function checkEmail(value: string) {
  if (!value.trim()) return "Введите email.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Проверьте email: нужен вид name@example.com.";
  return undefined;
}

export function checkUsername(value: string) {
  if (value.length < LIMITS.usernameMin || value.length > LIMITS.usernameMax)
    return `От ${LIMITS.usernameMin} до ${LIMITS.usernameMax} символов.`;
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Только латинские буквы, цифры и _.";
  return undefined;
}

export function checkPassword(value: string) {
  if (value.length < LIMITS.passwordMin) return `Не короче ${LIMITS.passwordMin} символов.`;
  if (value.length > LIMITS.passwordMax) return `Не длиннее ${LIMITS.passwordMax} символов.`;
  return undefined;
}

export function checkUrl(value: string) {
  const v = value.trim();
  if (!v) return undefined;
  if (v.length > LIMITS.coverUrl) return `Не длиннее ${LIMITS.coverUrl} символов.`;
  try {
    const url = new URL(v);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error();
  } catch {
    return "Нужна ссылка вида https://….";
  }
  return undefined;
}

export function parseDuration(value: string): number | null | undefined {
  const v = value.trim();
  if (!v) return null;
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(v);
  if (!match) return undefined;
  const seconds = Number(match[1]) * 60 + Number(match[2]);
  return seconds > 0 ? seconds : undefined;
}

export function isValid<F extends string>(errors: Errors<F>) {
  return Object.values(errors).every((e) => !e);
}

export function mergeErrors<F extends string>(...sources: Errors<F>[]): Errors<F> {
  const result: Errors<F> = {};
  for (const source of sources) {
    for (const [key, value] of Object.entries(source) as [F, string | undefined][]) {
      if (value) result[key] = value;
    }
  }
  return result;
}
