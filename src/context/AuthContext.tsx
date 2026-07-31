import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import api from "../services/api";

interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: number | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        setRole(payload.role);
        setUserId(payload.id);
      } catch {
        setToken(null);
        localStorage.removeItem("token");
      }
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const res = await api.post("/api/auth/login", { username, password });
    const newToken = res.data.token;
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
