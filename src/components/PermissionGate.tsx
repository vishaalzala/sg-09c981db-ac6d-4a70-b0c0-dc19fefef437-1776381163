import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import type { Permission } from "@/lib/permissions";

interface PermissionGateProps {
  children: ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render children based on user permissions
 * 
 * Usage:
 * <PermissionGate permission="customers:edit">
 *   <EditButton />
 * </PermissionGate>
 * 
 * <PermissionGate permissions={["quotes:approve", "invoices:create"]} requireAll={false}>
 *   <ActionButton />
 * </PermissionGate>
 */
export function PermissionGate({ 
  children, 
  permission, 
  permissions, 
  requireAll = true,
  fallback = null 
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  if (loading) {
    return null;
  }

  // Single permission check
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Multiple permissions check
  if (permissions) {
    const hasAccess = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasAccess) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
}