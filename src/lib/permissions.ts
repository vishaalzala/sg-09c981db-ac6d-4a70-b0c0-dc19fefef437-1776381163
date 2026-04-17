// Role-Based Access Control (RBAC) Permission System

export type UserRole =
  | "super_admin"
  | "owner"
  | "branch_manager"
  | "service_advisor"
  | "technician"
  | "parts_manager"
  | "wof_inspector"
  | "accountant"
  | "reception"
  | "customer_portal";

export type Permission =
  // Admin
  | "admin:access"
  | "admin:manage_companies"
  | "admin:manage_plans"
  | "admin:manage_addons"
  | "admin:view_analytics"
  | "admin:view_audit_logs"
  // Company Management
  | "company:view_settings"
  | "company:edit_settings"
  | "company:manage_users"
  | "company:manage_branches"
  | "company:view_billing"
  // Customer Management
  | "customers:view"
  | "customers:create"
  | "customers:edit"
  | "customers:delete"
  | "customers:merge"
  | "customers:export"
  // Vehicle Management
  | "vehicles:view"
  | "vehicles:create"
  | "vehicles:edit"
  | "vehicles:delete"
  | "vehicles:transfer"
  // Booking Management
  | "bookings:view"
  | "bookings:create"
  | "bookings:edit"
  | "bookings:delete"
  | "bookings:assign"
  // Job Management
  | "jobs:view"
  | "jobs:create"
  | "jobs:edit"
  | "jobs:delete"
  | "jobs:view_all"
  | "jobs:view_assigned"
  | "jobs:update_status"
  | "jobs:add_parts"
  | "jobs:add_labor"
  // Quote Management
  | "quotes:view"
  | "quotes:create"
  | "quotes:edit"
  | "quotes:delete"
  | "quotes:approve"
  | "quotes:convert_job"
  | "quotes:convert_invoice"
  // Invoice Management
  | "invoices:view"
  | "invoices:create"
  | "invoices:edit"
  | "invoices:delete"
  | "invoices:send"
  | "invoices:void"
  // Payment Management
  | "payments:view"
  | "payments:record"
  | "payments:refund"
  | "payments:view_methods"
  | "payments:manage_methods"
  // Supplier & Procurement
  | "suppliers:view"
  | "suppliers:create"
  | "suppliers:edit"
  | "suppliers:delete"
  | "purchase_orders:view"
  | "purchase_orders:create"
  | "purchase_orders:approve"
  // Inventory Management
  | "inventory:view"
  | "inventory:create"
  | "inventory:edit"
  | "inventory:delete"
  | "inventory:adjust"
  | "inventory:transfer"
  // WOF Compliance
  | "wof:access"
  | "wof:view"
  | "wof:create"
  | "wof:inspect"
  | "wof:approve"
  | "wof:reject"
  | "wof:recheck"
  | "wof:view_compliance"
  // Reports
  | "reports:view_basic"
  | "reports:view_financial"
  | "reports:view_operations"
  | "reports:export"
  // Staff Management
  | "staff:view"
  | "staff:create"
  | "staff:edit"
  | "staff:delete"
  | "staff:view_timesheets"
  | "staff:manage_timesheets"
  // Settings
  | "settings:view"
  | "settings:edit_company"
  | "settings:edit_website"
  | "settings:edit_reminders"
  | "settings:edit_payment_methods"
  | "settings:import_export";

// Role permission matrix
const rolePermissions: Record<UserRole, Permission[]> = {
  super_admin: [
    // Super Admin has ALL admin permissions
    "admin:access",
    "admin:manage_companies",
    "admin:manage_plans",
    "admin:manage_addons",
    "admin:view_analytics",
    "admin:view_audit_logs",
  ],

  owner: [
    // Full workshop access
    "company:view_settings",
    "company:edit_settings",
    "company:manage_users",
    "company:manage_branches",
    "company:view_billing",
    "customers:view",
    "customers:create",
    "customers:edit",
    "customers:delete",
    "customers:merge",
    "customers:export",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "vehicles:delete",
    "vehicles:transfer",
    "bookings:view",
    "bookings:create",
    "bookings:edit",
    "bookings:delete",
    "bookings:assign",
    "jobs:view",
    "jobs:create",
    "jobs:edit",
    "jobs:delete",
    "jobs:view_all",
    "jobs:update_status",
    "jobs:add_parts",
    "jobs:add_labor",
    "quotes:view",
    "quotes:create",
    "quotes:edit",
    "quotes:delete",
    "quotes:approve",
    "quotes:convert_job",
    "quotes:convert_invoice",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:delete",
    "invoices:send",
    "invoices:void",
    "payments:view",
    "payments:record",
    "payments:refund",
    "payments:view_methods",
    "payments:manage_methods",
    "suppliers:view",
    "suppliers:create",
    "suppliers:edit",
    "suppliers:delete",
    "purchase_orders:view",
    "purchase_orders:create",
    "purchase_orders:approve",
    "inventory:view",
    "inventory:create",
    "inventory:edit",
    "inventory:delete",
    "inventory:adjust",
    "inventory:transfer",
    "wof:access",
    "wof:view",
    "wof:create",
    "wof:inspect",
    "wof:approve",
    "wof:reject",
    "wof:recheck",
    "wof:view_compliance",
    "reports:view_basic",
    "reports:view_financial",
    "reports:view_operations",
    "reports:export",
    "staff:view",
    "staff:create",
    "staff:edit",
    "staff:delete",
    "staff:view_timesheets",
    "staff:manage_timesheets",
    "settings:view",
    "settings:edit_company",
    "settings:edit_website",
    "settings:edit_reminders",
    "settings:edit_payment_methods",
    "settings:import_export",
  ],

  branch_manager: [
    // Branch-level management
    "company:view_settings",
    "customers:view",
    "customers:create",
    "customers:edit",
    "customers:export",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "bookings:view",
    "bookings:create",
    "bookings:edit",
    "bookings:delete",
    "bookings:assign",
    "jobs:view",
    "jobs:create",
    "jobs:edit",
    "jobs:view_all",
    "jobs:update_status",
    "jobs:add_parts",
    "jobs:add_labor",
    "quotes:view",
    "quotes:create",
    "quotes:edit",
    "quotes:approve",
    "quotes:convert_job",
    "quotes:convert_invoice",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:send",
    "payments:view",
    "payments:record",
    "payments:view_methods",
    "suppliers:view",
    "suppliers:create",
    "purchase_orders:view",
    "purchase_orders:create",
    "inventory:view",
    "inventory:create",
    "inventory:edit",
    "inventory:adjust",
    "wof:access",
    "wof:view",
    "wof:create",
    "reports:view_basic",
    "reports:view_operations",
    "staff:view",
    "staff:view_timesheets",
    "settings:view",
  ],

  service_advisor: [
    // Customer-facing operations
    "customers:view",
    "customers:create",
    "customers:edit",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "bookings:view",
    "bookings:create",
    "bookings:edit",
    "bookings:assign",
    "jobs:view",
    "jobs:create",
    "jobs:edit",
    "jobs:view_all",
    "jobs:update_status",
    "quotes:view",
    "quotes:create",
    "quotes:edit",
    "quotes:approve",
    "quotes:convert_job",
    "quotes:convert_invoice",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:send",
    "payments:view",
    "payments:record",
    "payments:view_methods",
    "wof:view",
    "wof:create",
    "reports:view_basic",
  ],

  technician: [
    // Workshop floor operations
    "customers:view",
    "vehicles:view",
    "bookings:view",
    "jobs:view",
    "jobs:view_assigned",
    "jobs:update_status",
    "jobs:add_parts",
    "jobs:add_labor",
    "quotes:view",
    "inventory:view",
    "wof:view",
  ],

  parts_manager: [
    // Inventory and supplier management
    "customers:view",
    "vehicles:view",
    "jobs:view",
    "suppliers:view",
    "suppliers:create",
    "suppliers:edit",
    "purchase_orders:view",
    "purchase_orders:create",
    "purchase_orders:approve",
    "inventory:view",
    "inventory:create",
    "inventory:edit",
    "inventory:delete",
    "inventory:adjust",
    "inventory:transfer",
    "reports:view_basic",
  ],

  wof_inspector: [
    // WOF-specific operations
    "customers:view",
    "vehicles:view",
    "bookings:view",
    "jobs:view",
    "jobs:view_assigned",
    "jobs:update_status",
    "wof:access",
    "wof:view",
    "wof:create",
    "wof:inspect",
    "wof:approve",
    "wof:reject",
    "wof:recheck",
    "wof:view_compliance",
  ],

  accountant: [
    // Financial operations
    "customers:view",
    "vehicles:view",
    "jobs:view",
    "quotes:view",
    "invoices:view",
    "invoices:create",
    "invoices:edit",
    "invoices:send",
    "invoices:void",
    "payments:view",
    "payments:record",
    "payments:refund",
    "payments:view_methods",
    "reports:view_basic",
    "reports:view_financial",
    "reports:export",
  ],

  reception: [
    // Front desk operations
    "customers:view",
    "customers:create",
    "customers:edit",
    "vehicles:view",
    "vehicles:create",
    "vehicles:edit",
    "bookings:view",
    "bookings:create",
    "bookings:edit",
    "jobs:view",
    "quotes:view",
    "invoices:view",
    "payments:view",
    "payments:record",
    "payments:view_methods",
  ],

  customer_portal: [
    // Customer self-service
    "vehicles:view",
    "bookings:view",
    "bookings:create",
    "jobs:view",
    "quotes:view",
    "invoices:view",
    "payments:view",
  ],
};

// Check if role has specific permission
export function hasPermission(role: UserRole | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.includes(permission) ?? false;
}

// Check if role has any of the permissions
export function hasAnyPermission(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.some((p) => hasPermission(role, p));
}

// Check if role has all permissions
export function hasAllPermissions(role: UserRole | null | undefined, permissions: Permission[]): boolean {
  if (!role) return false;
  return permissions.every((p) => hasPermission(role, p));
}

// Get all permissions for a role
export function getRolePermissions(role: UserRole): Permission[] {
  return rolePermissions[role] ?? [];
}

// Check if role can access admin panel
export function canAccessAdmin(role: UserRole | null | undefined): boolean {
  return hasPermission(role, "admin:access");
}

// Check if role can access workshop features
export function canAccessWorkshop(role: UserRole | null | undefined): boolean {
  if (!role) return false;
  // Workshop access = not super_admin, not customer_portal
  return role !== "super_admin" && role !== "customer_portal";
}

// Check if role can access customer portal
export function canAccessPortal(role: UserRole | null | undefined): boolean {
  return role === "customer_portal";
}

// Navigation items with permission requirements
export type NavItem = {
  label: string;
  href: string;
  icon?: string;
  permissions: Permission[];
  requiredAddons?: string[]; // Optional: require specific add-ons
};

// Define navigation structure with permissions
export const navigationItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", permissions: ["customers:view"] },
  { label: "Customers", href: "/customers", permissions: ["customers:view"] },
  { label: "Vehicles", href: "/vehicles", permissions: ["vehicles:view"] },
  { label: "Bookings", href: "/bookings", permissions: ["bookings:view"] },
  { label: "Jobs", href: "/jobs", permissions: ["jobs:view"] },
  { label: "Quotes", href: "/quotes", permissions: ["quotes:view"] },
  { label: "Invoices", href: "/invoices", permissions: ["invoices:view"] },
  { label: "Suppliers", href: "/suppliers", permissions: ["suppliers:view"] },
  { label: "Inventory", href: "/inventory", permissions: ["inventory:view"] },
  { label: "WOF", href: "/wof", permissions: ["wof:access"], requiredAddons: ["wof_compliance"] },
  { label: "Reports", href: "/reports", permissions: ["reports:view_basic"] },
  { label: "Staff", href: "/staff", permissions: ["staff:view"] },
  { label: "Settings", href: "/settings", permissions: ["settings:view"] },
];

// Filter navigation items based on user role
export function getAccessibleNavItems(role: UserRole | null | undefined, enabledAddons: string[] = []): NavItem[] {
  if (!role) return [];

  return navigationItems.filter((item) => {
    // Check permissions
    const hasRequiredPermission = hasAnyPermission(role, item.permissions);
    if (!hasRequiredPermission) return false;

    // Check add-on requirements
    if (item.requiredAddons && item.requiredAddons.length > 0) {
      const hasRequiredAddons = item.requiredAddons.every((addon) => enabledAddons.includes(addon));
      if (!hasRequiredAddons) return false;
    }

    return true;
  });
}