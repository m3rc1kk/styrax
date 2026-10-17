import { Link, NavLink, useLocation } from "react-router";
import { loginPath } from "../auth/RequireAuth";
import { useAuth } from "../auth/AuthContext";
import { Button, ButtonLink } from "./Button";
import { Skeleton } from "./Skeleton";
import styles from "./Header.module.css";

export function Header() {
  const { status, user, logout } = useAuth();
  const location = useLocation();
  const onAuthPage = location.pathname === "/login" || location.pathname === "/register";

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo} translate="no">
          Styrax
        </Link>

        <nav className={styles.nav} aria-label="Основная навигация">
          <NavLink to="/" end className={styles.navLink}>
            Каталог
          </NavLink>
          {status === "authenticated" && (
            <NavLink to="/me" className={styles.navLink}>
              Мои оценки
            </NavLink>
          )}
        </nav>

        <div className={styles.auth}>
          {status === "loading" && <Skeleton variant="number" />}
          {status === "authenticated" && user && (
            <>
              <ButtonLink to="/albums/new" variant="secondary" className={styles.add}>
                Добавить альбом
              </ButtonLink>
              <span className={styles.user}>{user.username}</span>
              <Button variant="text" onClick={() => void logout()}>
                Выйти
              </Button>
            </>
          )}
          {status === "guest" && !onAuthPage && (
            <>
              <Link className={styles.textLink} to={loginPath(location.pathname + location.search)}>
                Войти
              </Link>
              <ButtonLink to="/register" variant="primary" className={styles.add}>
                Регистрация
              </ButtonLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
