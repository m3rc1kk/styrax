import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Skeleton } from "../components/Skeleton";
import { useAuth } from "./AuthContext";

export function loginPath(next: string) {
  return `/login?next=${encodeURIComponent(next)}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <div aria-busy="true">
        <p className="visually-hidden" role="status">
          Проверяем вход…
        </p>
        <Skeleton variant="title" />
      </div>
    );
  }
  if (status === "guest") return <Navigate to={loginPath(location.pathname + location.search)} replace />;
  return children;
}

export function safeNext(next: string | null) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
