import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

export interface AuthUser {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  nickname: string;
  bio?: string;
  avatarUrl?: string;
  // agrega más campos si el backend los expone
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // logout debe estar definido antes para poder usarlo en useEffect
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setLoading(false);
  };

  useEffect(() => {
    const t = localStorage.getItem("token");
    if (t) {
      setToken(t);
      setLoading(true);
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Token inválido");
          return res.json();
        })
        .then((data) => setUser(data))
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (t: string) => {
    setToken(t);
    localStorage.setItem("token", t);
    setLoading(true);
    fetch("/api/auth/me", {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Token inválido");
        return res.json();
      })
      .then((data) => setUser(data))
      .catch(() => {
        logout();
      })
      .finally(() => setLoading(false));
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
