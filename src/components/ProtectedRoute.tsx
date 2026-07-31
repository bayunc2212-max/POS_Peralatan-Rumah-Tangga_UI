import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { ReactNode } from "react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: ReactNode;
  role?: string;
}) {
  const { token, role: userRole } = useAuth();

  if (!token) return <Navigate to="/login" replace />;

  if (role && userRole !== role) return <Navigate to="/" replace />;

  return <>{children}</>;
}
