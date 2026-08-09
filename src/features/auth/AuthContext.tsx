import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, Platform } from "react-native";

import { missingPublicEnv } from "@/src/lib/env";
import { supabase } from "@/src/lib/supabase";
import { getErrorMessage } from "@/src/utils/getErrorMessage";

type Credentials = { email: string; password: string };
type SignUpResult = { requiresEmailVerification: boolean };

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isProcessingAuthLink: boolean;
  isPasswordRecovery: boolean;
  authLinkError: string | null;
  configurationError: string | null;
  signIn: (credentials: Credentials) => Promise<void>;
  signUp: (credentials: Credentials) => Promise<SignUpResult>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  clearAuthLinkError: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const authCallbackUrl = Linking.createURL("/auth-callback");

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      `Missing Supabase configuration: ${missingPublicEnv.join(", ")}`,
    );
  }

  return supabase;
}

function getUrlParameters(url: string) {
  const parsedUrl = new URL(url);
  const search = new URLSearchParams(parsedUrl.search);
  const hash = new URLSearchParams(parsedUrl.hash.replace(/^#/, ""));

  return {
    get(name: string) {
      return search.get(name) ?? hash.get(name);
    },
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isProcessingAuthLink, setIsProcessingAuthLink] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [authLinkError, setAuthLinkError] = useState<string | null>(null);

  let configurationError: string | null = null;
  if (!supabase) {
    configurationError = `Missing Supabase configuration: ${missingPublicEnv.join(", ")}`;
  }

  const processAuthUrl = useCallback(async (url: string) => {
    const client = requireSupabase();
    const parameters = getUrlParameters(url);
    const errorDescription = parameters.get("error_description");
    const errorCode = parameters.get("error_code") ?? parameters.get("error");
    const code = parameters.get("code");
    const accessToken = parameters.get("access_token");
    const refreshToken = parameters.get("refresh_token");
    const linkType = parameters.get("type");
    const containsAuthData = Boolean(
      errorDescription || errorCode || code || accessToken || refreshToken,
    );

    if (!containsAuthData) {
      return;
    }

    setIsProcessingAuthLink(true);
    setAuthLinkError(null);

    try {
      if (errorDescription || errorCode) {
        throw new Error(errorDescription ?? errorCode ?? "Authentication link failed.");
      }

      if (linkType === "recovery") {
        setIsPasswordRecovery(true);
      }

      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) throw error;
      } else if (accessToken && refreshToken) {
        const { error } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (error) throw error;
      } else {
        throw new Error("The authentication link is incomplete or expired.");
      }
    } catch (error) {
      setIsPasswordRecovery(false);
      setAuthLinkError(getErrorMessage(error));
    } finally {
      setIsProcessingAuthLink(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setIsInitializing(false);
      return;
    }

    let mounted = true;
    const client = supabase;
    const { data: authListener } = client.auth.onAuthStateChange((event, nextSession) => {
      if (!mounted) return;
      if (event === "PASSWORD_RECOVERY") setIsPasswordRecovery(true);
      setSession(nextSession);
    });

    const urlListener = Linking.addEventListener("url", ({ url }) => {
      void processAuthUrl(url);
    });

    let appStateListener: ReturnType<typeof AppState.addEventListener> | null = null;
    if (Platform.OS !== "web") {
      appStateListener = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          client.auth.startAutoRefresh();
        } else {
          client.auth.stopAutoRefresh();
        }
      });
    }

    async function initialize() {
      try {
        const [{ data, error }, initialUrl] = await Promise.all([
          client.auth.getSession(),
          Linking.getInitialURL(),
        ]);

        if (error) throw error;
        if (mounted) setSession(data.session);
        if (initialUrl) await processAuthUrl(initialUrl);
      } catch (error) {
        if (mounted) setAuthLinkError(getErrorMessage(error));
      } finally {
        if (mounted) setIsInitializing(false);
      }
    }

    void initialize();

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
      urlListener.remove();
      appStateListener?.remove();
      if (Platform.OS !== "web") client.auth.stopAutoRefresh();
    };
  }, [processAuthUrl]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      isInitializing,
      isProcessingAuthLink,
      isPasswordRecovery,
      authLinkError,
      configurationError,
      signIn: async ({ email, password }) => {
        const { error } = await requireSupabase().auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      },
      signUp: async ({ email, password }) => {
        const { data, error } = await requireSupabase().auth.signUp({
          email,
          password,
          options: { emailRedirectTo: authCallbackUrl },
        });
        if (error) throw error;
        return { requiresEmailVerification: !data.session };
      },
      signOut: async () => {
        const { error } = await requireSupabase().auth.signOut();
        if (error) throw error;
        setIsPasswordRecovery(false);
      },
      requestPasswordReset: async (email) => {
        const { error } = await requireSupabase().auth.resetPasswordForEmail(email, {
          redirectTo: authCallbackUrl,
        });
        if (error) throw error;
      },
      resendVerification: async (email) => {
        const { error } = await requireSupabase().auth.resend({
          type: "signup",
          email,
          options: { emailRedirectTo: authCallbackUrl },
        });
        if (error) throw error;
      },
      updatePassword: async (password) => {
        const { error } = await requireSupabase().auth.updateUser({ password });
        if (error) throw error;
        setIsPasswordRecovery(false);
      },
      clearAuthLinkError: () => setAuthLinkError(null),
    }),
    [
      authLinkError,
      configurationError,
      isInitializing,
      isPasswordRecovery,
      isProcessingAuthLink,
      session,
    ],
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
