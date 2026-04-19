import { useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";

interface ProtectedRouteProps {
  children: ReactNode;
  requireSuperAdmin?: boolean;
}

export function ProtectedRoute({ children, requireSuperAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // DEMO MODE: Check if demo mode is enabled
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  useEffect(() => {
    // DEMO MODE: Skip all auth checks and allow access
    if (isDemoMode) {
      console.log("🎭 DEMO MODE - Bypassing auth check, granting access");
      setAuthorized(true);
      setLoading(false);
      return;
    }

    // PRODUCTION MODE: Normal auth checks
    checkAuth();
  }, [isDemoMode]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      if (requireSuperAdmin) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role !== "super_admin") {
          router.push("/dashboard");
          return;
        }
      }

      setAuthorized(true);
    } catch (error) {
      console.error("Auth check error:", error);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {isDemoMode && <div className="mb-4 text-sm text-muted-foreground">🎭 Demo Mode</div>}
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}