import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { onAccessTokenChange, refreshAccessToken, setAccessToken } from "../api/client";
import * as api from "../api/endpoints";
import { keys } from "../api/keys";
import type { RegisterInput, User } from "../api/types";

type AuthStatus = "loading" | "guest" | "authenticated";

type AuthValue = {
  status: AuthStatus;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthValue | null>(null);

let bootstrap: Promise<User | null> | null = null;

function restoreSession(): Promise<User | null> {
  bootstrap ??= (async () => {
    try {
      const token = await refreshAccessToken();
      return token ? await api.getMe() : null;
    } catch {
      return null;
    }
  })();
  return bootstrap;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");

  const forgetPersonal = useCallback(() => {
    queryClient.removeQueries({ predicate: (query) => keys.isPersonal(query.queryKey) });
  }, [queryClient]);

  useEffect(() => {
    let active = true;
    restoreSession().then((restored) => {
      if (!active) return;
      setUser(restored);
      setStatus(restored ? "authenticated" : "guest");
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(
    () =>
      onAccessTokenChange((token) => {
        if (token) return;
        setUser(null);
        setStatus("guest");
        forgetPersonal();
      }),
    [forgetPersonal],
  );

  const login = useCallback(async (email: string, password: string) => {
    const { access_token } = await api.login(email, password);
    setAccessToken(access_token);
    const me = await api.getMe();
    setUser(me);
    setStatus("authenticated");
  }, []);

  const register = useCallback(
    async (data: RegisterInput) => {
      await api.register(data);
      await login(data.email, data.password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await api.logout().catch(() => undefined);
    setAccessToken(null);
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout }),
    [status, user, login, register, logout],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
  return value;
}
