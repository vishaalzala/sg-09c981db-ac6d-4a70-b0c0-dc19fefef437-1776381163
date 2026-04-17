import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  type UserRole,
  type Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessAdmin,
  canAccessWorkshop,
  canAccessPortal,
  getAccessibleNavItems,
  type NavItem,
} from "@/lib/permissions";

export type UserPermissions = {
  role: UserRole | null;
  permissions: Permission[];
  enabledAddons: string[];
  loading: boolean;
};

export function usePermissions() {
  const [state, setState] = useState<UserPermissions>({
    role: null,
    permissions: [],
    enabledAddons: [],
    loading: true,
  });

  useEffect(() => {
    loadPermissions();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadPermissions();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function loadPermissions() {
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        setState({ role: null, permissions: [], enabledAddons: [], loading: false });
        return;
      }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();

      const role = (profile?.role as UserRole) ?? null;

      // Get enabled add-ons for the user's company
      let enabledAddons: string[] = [];
      if (role && role !== "super_admin") {
        const { data: user } = await supabase.from("users").select("company_id").eq("id", auth.user.id).maybeSingle();

        if (user?.company_id) {
          const { data: addons } = await supabase
            .from("company_addons")
            .select("addon_id")
            .eq("company_id", user.company_id)
            .eq("is_enabled", true);

          enabledAddons = addons?.map((a) => a.addon_id) ?? [];
        }
      }

      setState({
        role,
        permissions: [], // Permissions are checked via hasPermission(role, permission)
        enabledAddons,
        loading: false,
      });
    } catch (error) {
      console.error("Load permissions error:", error);
      setState({ role: null, permissions: [], enabledAddons: [], loading: false });
    }
  }

  return {
    ...state,
    can: (permission: Permission) => hasPermission(state.role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(state.role, permissions),
    canAll: (permissions: Permission[]) => hasAllPermissions(state.role, permissions),
    canAccessAdmin: () => canAccessAdmin(state.role),
    canAccessWorkshop: () => canAccessWorkshop(state.role),
    canAccessPortal: () => canAccessPortal(state.role),
    getNavItems: () => getAccessibleNavItems(state.role, state.enabledAddons),
    refresh: loadPermissions,
  };
}