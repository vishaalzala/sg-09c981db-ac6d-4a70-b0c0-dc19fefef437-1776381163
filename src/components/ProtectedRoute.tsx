import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

export function ProtectedRoute({ children, requireAuth = true }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push("/login");
    }
  }, [user, loading, requireAuth, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (requireAuth && !user) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}