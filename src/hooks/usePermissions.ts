import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface UsePermissionsReturn {
  permissions: Permission[];
  hasPermission: (permissionName: string) => boolean;
  hasAnyPermission: (permissionNames: string[]) => boolean;
  hasAllPermissions: (permissionNames: string[]) => boolean;
  loading: boolean;
  role: string | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

/**
 * Hook to check user permissions for UI element gating
 * 
 * Usage:
 * const { hasPermission, isAdmin } = usePermissions();
 * 
 * if (hasPermission('edit_customers')) {
 *   // Show edit button
 * }
 * 
 * // OR use in JSX:
 * {hasPermission('delete_invoice') && <DeleteButton />}
 */
export function usePermissions(): UsePermissionsReturn {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 2. Get user's role from profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!profile?.role) {
        setLoading(false);
        return;
      }

      setRole(profile.role);

      // 3. Super admin has all permissions - skip database query
      if (profile.role === "super_admin") {
        setPermissions([]);
        setLoading(false);
        return;
      }

      // 4. Get role_id from users table
      const { data: userData } = await supabase
        .from("users")
        .select("role_id")
        .eq("id", user.id)
        .single();

      if (!userData?.role_id) {
        setLoading(false);
        return;
      }

      // 5. Get permissions for this role
      const { data: rolePermissions } = await supabase
        .from("role_permissions")
        .select(`
          permissions (
            id,
            name,
            category,
            description
          )
        `)
        .eq("role_id", userData.role_id);

      if (rolePermissions) {
        const perms = rolePermissions
          .map((rp: any) => rp.permissions)
          .filter(Boolean);
        setPermissions(perms);
      }
    } catch (error) {
      console.error("Error loading permissions:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permissionName: string): boolean => {
    // Super admin has all permissions
    if (role === "super_admin") return true;
    
    // Admin has all permissions
    if (role === "admin") return true;

    // Check user's permission list
    return permissions.some(p => p.name === permissionName);
  };

  /**
   * Check if user has ANY of the specified permissions
   */
  const hasAnyPermission = (permissionNames: string[]): boolean => {
    if (role === "super_admin" || role === "admin") return true;
    return permissionNames.some(name => hasPermission(name));
  };

  /**
   * Check if user has ALL of the specified permissions
   */
  const hasAllPermissions = (permissionNames: string[]): boolean => {
    if (role === "super_admin" || role === "admin") return true;
    return permissionNames.every(name => hasPermission(name));
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loading,
    role,
    isAdmin: role === "admin",
    isSuperAdmin: role === "super_admin"
  };
}

/**
 * Higher-order component wrapper for permission-based rendering
 * 
 * Usage:
 * <PermissionGate permission="edit_customers">
 *   <EditButton />
 * </PermissionGate>
 */
interface PermissionGateProps {
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionGate({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) return null;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAnyPermission(anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}