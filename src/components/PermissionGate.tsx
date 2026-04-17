import { type ReactNode } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { type Permission } from "@/lib/permissions";

type PermissionGateProps = {
  permissions: Permission | Permission[];
  requireAll?: boolean;
  fallback?: ReactNode;
  children: ReactNode;
};

export function PermissionGate({ permissions, requireAll = false, fallback = null, children }: PermissionGateProps) {
  const { can, canAny, canAll, loading } = usePermissions();

  if (loading) {
    return <>{fallback}</>;
  }

  const permissionsArray = Array.isArray(permissions) ? permissions : [permissions];

  const hasAccess = requireAll ? canAll(permissionsArray) : canAny(permissionsArray);

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}