import { API_URL } from "../api/client";

const LOOPBACK_ALIASES = ["127.0.0.1", "0.0.0.0", "[::1]"];

export function redirectToApiHost(): boolean {
  const api = new URL(API_URL);
  if (api.hostname !== "localhost" || !LOOPBACK_ALIASES.includes(window.location.hostname)) return false;

  const target = new URL(window.location.href);
  target.hostname = "localhost";
  window.location.replace(target.href);
  return true;
}
