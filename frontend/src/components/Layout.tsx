import { Outlet, useLocation } from "react-router";
import { Header } from "./Header";
import styles from "./Layout.module.css";

export function Layout() {
  const { pathname } = useLocation();

  return (
    <>
      <a className={styles.skip} href="#main">
        К содержанию
      </a>
      <Header />
      <main id="main" className={styles.main} tabIndex={-1}>
        <div key={pathname} className={styles.page}>
          <Outlet />
        </div>
      </main>
    </>
  );
}
