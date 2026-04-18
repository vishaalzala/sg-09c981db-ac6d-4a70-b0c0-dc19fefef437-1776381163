import { ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";

interface PermissionGateProps {
  permission?: string;
  anyPermission?: string[];
  allPermissions?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component wrapper to conditionally render UI based on permissions
 * 
 * Usage Examples:
 * 
 * // Single permission
 * <PermissionGate permission="edit_customers">
 *   <EditButton />
 * </PermissionGate>
 * 
 * // Any of multiple permissions
 * <PermissionGate anyPermission={["edit_customers", "delete_customers"]}>
 *   <CustomerActions />
 * </PermissionGate>
 * 
 * // All of multiple permissions
 * <PermissionGate allPermissions={["view_reports", "export_data"]}>
 *   <ExportButton />
 * </PermissionGate>
 * 
 * // With fallback
 * <PermissionGate permission="edit_settings" fallback={<span>Access Denied</span>}>
 *   <SettingsForm />
 * </PermissionGate>
 */
export function PermissionGate({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null
}: PermissionGateProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, loading } = usePermissions();

  // Don't render anything while loading
  if (loading) return null;

  let hasAccess = false;

  // Check permission type
  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (anyPermission && anyPermission.length > 0) {
    hasAccess = hasAnyPermission(anyPermission);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(allPermissions);
  }

  // Render fallback if no access
  if (!hasAccess) {
    return <>{fallback}</>;
  }

  // Render children if has access
  return <>{children}</>;
}