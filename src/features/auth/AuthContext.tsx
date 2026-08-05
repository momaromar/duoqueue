import { createContext, useContext, useMemo, useState } from "react";

type AuthContextValue = {
  isAuthenticated: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const mockDelay = () => new Promise<void>((resolve) => setTimeout(resolve, 500));

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // This state intentionally resets on reload until real authentication is added.
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthenticated,
      signIn: async () => {
        await mockDelay();
        setIsAuthenticated(true);
      },
      signUp: async () => {
        await mockDelay();
        setIsAuthenticated(true);
      },
      signOut: () => setIsAuthenticated(false),
    }),
    [isAuthenticated],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
