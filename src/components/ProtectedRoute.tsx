import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/auth-provider";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Esperamos a que termine la carga global
    if (loading) {
      setChecking(true);
    } else {
      setChecking(false);
    }
  }, [loading]);

  if (checking) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando...
      </div>
    );
  }
  // Si no hay token, redirigimos al login
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
