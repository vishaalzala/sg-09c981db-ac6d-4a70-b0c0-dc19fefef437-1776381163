import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useRouter } from "next/router";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // DEMO MODE: Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    // DEMO MODE: Bypass real auth and return mock user
    if (isDemoMode) {
      console.log("🎭 DEMO MODE ENABLED - Using mock authentication");
      const mockUser = {
        id: "demo-user-id",
        email: "admin@demo.com",
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: {
          full_name: "Demo Admin"
        },
        aud: "authenticated",
        role: "authenticated"
      } as User;

      setUser(mockUser);
      setSession({
        access_token: "demo-token",
        refresh_token: "demo-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user: mockUser
      } as Session);
      setLoading(false);
      return;
    }

    // PRODUCTION MODE: Normal auth flow
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [isDemoMode]);

  const signOut = async () => {
    // DEMO MODE: Just redirect without calling Supabase
    if (isDemoMode) {
      console.log("🎭 DEMO MODE - Simulating sign out");
      router.push("/login");
      return;
    }

    // PRODUCTION MODE: Real sign out
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};