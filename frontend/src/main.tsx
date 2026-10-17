import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter } from "react-router";
import { RouterProvider } from "react-router/dom";
import { queryClient } from "./api/queries";
import { AuthProvider } from "./auth/AuthContext";
import { RequireAuth } from "./auth/RequireAuth";
import { Layout } from "./components/Layout";
import { StatusBlock } from "./components/StatusBlock";
import { redirectToApiHost } from "./lib/canonicalHost";
import { AlbumPage } from "./pages/album/AlbumPage";
import { ArtistPage } from "./pages/artist/ArtistPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { EditAlbumPage, NewAlbumPage } from "./pages/edit/AlbumFormPage";
import { EditArtistPage, NewArtistPage } from "./pages/edit/ArtistFormPage";
import { HomePage } from "./pages/home/HomePage";
import { MyRatingsPage } from "./pages/me/MyRatingsPage";
import { TrackPage } from "./pages/track/TrackPage";
import "./styles/tokens.css";
import "./styles/base.css";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <HomePage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },

      { path: "/albums/:id", element: <AlbumPage /> },
      { path: "/artists/:id", element: <ArtistPage /> },
      { path: "/tracks/:id", element: <TrackPage /> },

      { path: "/me", element: <RequireAuth><MyRatingsPage /></RequireAuth> },
      { path: "/albums/new", element: <RequireAuth><NewAlbumPage /></RequireAuth> },
      { path: "/albums/:id/edit", element: <RequireAuth><EditAlbumPage /></RequireAuth> },
      { path: "/artists/new", element: <RequireAuth><NewArtistPage /></RequireAuth> },
      { path: "/artists/:id/edit", element: <RequireAuth><EditArtistPage /></RequireAuth> },

      { path: "*", element: <StatusBlock code="404" title="Страница не найдена" /> },
    ],
  },
]);

if (!redirectToApiHost()) {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
}
