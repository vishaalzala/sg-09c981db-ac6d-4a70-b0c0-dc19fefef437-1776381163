import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { LoadingSpinner } from "./LoadingSpinner";
import { canAccessAdmin, canAccessWorkshop, canAccessPortal, type UserRole } from "@/lib/permissions";

type ProtectedRouteProps = {
  children: ReactNode;
  requireRole?: UserRole | UserRole[];
  requireAdmin?: boolean;
  requireWorkshop?: boolean;
  requirePortal?: boolean;
};

export function ProtectedRoute({
  children,
  requireRole,
  requireAdmin = false,
  requireWorkshop = false,
  requirePortal = false,
}: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, [router.pathname]);

  async function checkAuth() {
    try {
      const { data: auth } = await supabase.auth.getUser();

      if (!auth.user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();

      const userRole = (profile?.role as UserRole) ?? null;

      // Check specific role requirement
      if (requireRole) {
        const requiredRoles = Array.isArray(requireRole) ? requireRole : [requireRole];
        if (!userRole || !requiredRoles.includes(userRole)) {
          router.replace("/dashboard");
          return;
        }
      }

      // Check admin requirement
      if (requireAdmin && !canAccessAdmin(userRole)) {
        router.replace("/dashboard");
        return;
      }

      // Check workshop requirement
      if (requireWorkshop && !canAccessWorkshop(userRole)) {
        router.replace("/portal");
        return;
      }

      // Check portal requirement
      if (requirePortal && !canAccessPortal(userRole)) {
        router.replace("/dashboard");
        return;
      }

      setAuthorized(true);
      setLoading(false);
    } catch (error) {
      console.error("Auth check error:", error);
      router.replace("/login");
    }
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!authorized) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}