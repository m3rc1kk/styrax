import { API_URL, ApiError, NetworkError } from "../api/client";

export function describeError(error: unknown): string {
  if (error instanceof NetworkError) {
    return (
      `Не удалось связаться с сервером ${API_URL}. Проверьте, что бэкенд запущен ` +
      `и что адрес сайта ${window.location.origin} есть в CORS_ORIGINS бэкенда.`
    );
  }
  if (error instanceof ApiError) {
    if (error.status === 401) return "Сессия истекла. Войдите снова.";
    if (error.status === 403) return "Недостаточно прав для этого действия.";
    if (error.status === 404) return "Запись не найдена: возможно, её удалили.";
    if (error.status >= 500) return `Сервер вернул ошибку ${error.status}. Попробуйте позже.`;
    return error.detail ?? `Сервер отклонил запрос (код ${error.status}).`;
  }
  return "Что-то пошло не так. Обновите страницу.";
}

export function fieldErrorsOf(error: unknown): Record<string, string> {
  return error instanceof ApiError && error.status === 422 ? error.fieldErrors : {};
}

export const NOT_OWNER = "Менять и удалять запись может только тот, кто её добавил.";
