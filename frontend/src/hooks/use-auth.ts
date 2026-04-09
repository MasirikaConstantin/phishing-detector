import { useEffect, useState } from "react";

import type { LoginResponse } from "@/lib/types";
import { clearAuth, getAuth, saveAuth } from "@/lib/storage";

export function useAuth() {
  const [auth, setAuth] = useState<LoginResponse | null>(() => getAuth());

  useEffect(() => {
    setAuth(getAuth());
  }, []);

  const login = (payload: LoginResponse) => {
    saveAuth(payload);
    setAuth(payload);
  };

  const logout = () => {
    clearAuth();
    setAuth(null);
  };

  return {
    auth,
    token: auth?.access_token,
    isAdmin: auth?.user.role === "admin",
    login,
    logout,
  };
}
