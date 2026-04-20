import { supabase } from "@/integrations/supabase/client";
import type { Permission, UserRole } from "@/lib/permissions";
import { hasPermission, hasAnyPermission, hasAllPermissions } from "@/lib/permissions";

interface UserPermissions {
  role: UserRole | null;
  companyId: string | null;
  branchId: string | null;
  enabledAddons: string[];
}

/**
 * Permission service for runtime RBAC checks
 * Integrates with database to validate user permissions
 */
export const permissionService = {
  /**
   * Get current user's permissions and context
   */
  async getUserPermissions(): Promise<UserPermissions> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { role: null, companyId: null, branchId: null, enabledAddons: [] };
      }

      // Get user profile with role
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      // Get user's company and branch assignment
      const { data: userData } = await supabase
        .from("users")
        .select("company_id, branch_id")
        .eq("id", user.id)
        .maybeSingle();

      // Get company's enabled add-ons
      let enabledAddons: string[] = [];
      if (userData?.company_id) {
        const { data: addons } = await supabase
          .from("company_addons")
          .select("addon_id, addons(slug)")
          .eq("company_id", userData.company_id)
          .eq("is_active", true);

        enabledAddons = addons?.map((a: any) => a.addons?.slug).filter(Boolean) || [];
      }

      return {
        role: (profile?.role as UserRole) || null,
        companyId: userData?.company_id || null,
        branchId: userData?.branch_id || null,
        enabledAddons
      };
    } catch (error) {
      console.error("Error loading user permissions:", error);
      return { role: null, companyId: null, branchId: null, enabledAddons: [] };
    }
  },

  /**
   * Check if current user has specific permission
   */
  async canAccess(permission: Permission): Promise<boolean> {
    const { role } = await this.getUserPermissions();
    return hasPermission(role, permission);
  },

  /**
   * Check if current user has any of the permissions
   */
  async canAccessAny(permissions: Permission[]): Promise<boolean> {
    const { role } = await this.getUserPermissions();
    return hasAnyPermission(role, permissions);
  },

  /**
   * Check if current user has all permissions
   */
  async canAccessAll(permissions: Permission[]): Promise<boolean> {
    const { role } = await this.getUserPermissions();
    return hasAllPermissions(role, permissions);
  },

  /**
   * Check if user can access WOF module
   */
  async canAccessWOF(): Promise<boolean> {
    const { role, enabledAddons } = await this.getUserPermissions();
    const hasWOFPermission = hasPermission(role, "wof:access");
    const hasWOFAddon = enabledAddons.includes("wof_compliance");
    return hasWOFPermission && hasWOFAddon;
  },

  /**
   * Check if user can manage inventory
   */
  async canManageInventory(): Promise<boolean> {
    return await this.canAccess("inventory:edit");
  },

  /**
   * Check if user can approve quotes
   */
  async canApproveQuotes(): Promise<boolean> {
    return await this.canAccess("quotes:approve");
  },

  /**
   * Check if user can manage company settings
   */
  async canManageCompany(): Promise<boolean> {
    return await this.canAccess("company:edit_settings");
  },

  /**
   * Check if user can manage users
   */
  async canManageUsers(): Promise<boolean> {
    return await this.canAccess("company:manage_users");
  },

  /**
   * Check if user can view financial reports
   */
  async canViewFinancials(): Promise<boolean> {
    return await this.canAccess("reports:view_financial");
  },

  /**
   * Validate user belongs to company (for multi-tenant isolation)
   */
  async validateCompanyAccess(companyId: string): Promise<boolean> {
    const { companyId: userCompanyId, role } = await this.getUserPermissions();
    
    // Super admin can access all companies
    if (role === "super_admin") return true;
    
    // User must belong to the company
    return userCompanyId === companyId;
  },

  /**
   * Validate user can access specific branch
   */
  async validateBranchAccess(branchId: string): Promise<boolean> {
    const { branchId: userBranchId, role } = await this.getUserPermissions();
    
    // Owner and branch managers can access all branches in their company
    if (role === "owner" || role === "branch_manager") return true;
    
    // Other roles must be assigned to the specific branch
    return userBranchId === branchId;
  },

  /**
   * Get user's accessible branch IDs
   */
  async getAccessibleBranches(): Promise<string[]> {
    const { companyId, branchId, role } = await this.getUserPermissions();
    
    if (!companyId) return [];
    
    // Owner and managers can access all branches
    if (role === "owner" || role === "branch_manager") {
      const { data: branches } = await supabase
        .from("branches")
        .select("id")
        .eq("company_id", companyId);
      return branches?.map(b => b.id) || [];
    }
    
    // Other roles only access their assigned branch
    return branchId ? [branchId] : [];
  }
};