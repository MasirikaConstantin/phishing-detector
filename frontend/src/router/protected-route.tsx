import { Navigate } from "react-router-dom";
import type { PropsWithChildren } from "react";

import { useAuth } from "@/hooks/use-auth";

export function ProtectedRoute({ children }: PropsWithChildren) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
