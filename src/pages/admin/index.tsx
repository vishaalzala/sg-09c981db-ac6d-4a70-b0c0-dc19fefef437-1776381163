import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
    getDashboardStats,
    getControlCenterData,
    getAllCompanies,
    getAllUsers,
    getAllPlans,
    getAllAddons,
    getAuditLogs,
    searchCompanies,
    searchUsers,
    getAllRoles,
    getAllPermissions,
    getRolePermissions,
    assignPermissionToRole,
    removePermissionFromRole,
    createRole,
    updateRole,
    deleteRole,
    createPermission,
    updatePermission,
    deletePermission,
    type DashboardStats,
    type ControlCenterData
} from "@/services/adminService";
import {
    Building2,
    Users,
    Clock,
    CreditCard,
    Plus,
    Shield,
    Search,
    AlertTriangle,
    Edit,
    Trash2,
    CheckCircle2,
    XCircle,
    FileText
} from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import Link from "next/link";
import { ControlCenterPanel } from "@/components/admin/ControlCenterPanel";
import { demoCompanies } from "@/lib/demoData";

export default function AdminPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState("dashboard");
    const [stats, setStats] = useState < DashboardStats | null > (null);
    const [controlCenterData, setControlCenterData] = useState < ControlCenterData | null > (null);
    const [companies, setCompanies] = useState < any[] > ([]);
    const [users, setUsers] = useState < any[] > ([]);
    const [plans, setPlans] = useState < Tables < "subscription_plans" > [] > ([]);
    const [addons, setAddons] = useState < Tables < "addon_catalog" > [] > ([]);
    const [auditLogs, setAuditLogs] = useState < any[] > ([]);
    const [roles, setRoles] = useState < any[] > ([]);
    const [permissions, setPermissions] = useState < any[] > ([]);
    const [selectedRole, setSelectedRole] = useState < any > (null);
    const [rolePermissions, setRolePermissions] = useState < any[] > ([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Role management state
    const [createRoleOpen, setCreateRoleOpen] = useState(false);
    const [editRoleOpen, setEditRoleOpen] = useState(false);
    const [deleteRoleOpen, setDeleteRoleOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState < any > (null);
    const [roleToDelete, setRoleToDelete] = useState < any > (null);
    const [newRole, setNewRole] = useState({ name: "", display_name: "", description: "" });

    // Permission management state
    const [createPermissionOpen, setCreatePermissionOpen] = useState(false);
    const [editPermissionOpen, setEditPermissionOpen] = useState(false);
    const [deletePermissionOpen, setDeletePermissionOpen] = useState(false);
    const [permissionToEdit, setPermissionToEdit] = useState < any > (null);
    const [permissionToDelete, setPermissionToDelete] = useState < any > (null);
    const [newPermission, setNewPermission] = useState({ name: "", category: "", description: "" });

    // DEMO MODE: Check if demo mode is enabled
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

    // Initialize tab from URL
    useEffect(() => {
        const tabFromUrl = router.query.tab as string;
        if (tabFromUrl) {
            setActiveTab(tabFromUrl);
        }
    }, [router.query.tab]);

    useEffect(() => {
        loadData();
    }, [activeTab]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            // DEMO MODE: Use mock data
            if (isDemoMode) {
                console.log("🎭 DEMO MODE - Loading data for tab:", activeTab);

                if (activeTab === "dashboard") {
                    setStats({
                        totalCompanies: demoCompanies.length,
                        activeCompanies: demoCompanies.length,
                        inactiveCompanies: 0,
                        totalUsers: demoCompanies.length * 5,
                        trialCompanies: demoCompanies.length,
                        paidCompanies: 0,
                        totalRevenue: 0,
                        alerts: [],
                        recentSignups: demoCompanies,
                        recentChanges: []
                    } as DashboardStats);
                } else if (activeTab === "control") {
                    const controlData = await getControlCenterData();
                    setControlCenterData(controlData);
                } else if (activeTab === "companies") {
                    setCompanies(demoCompanies);
                }

                setLoading(false);
                return;
            }

            // PRODUCTION MODE: Load real data
            console.log("Loading data for tab:", activeTab);

            if (activeTab === "dashboard") {
                const dashStats = await getDashboardStats();
                setStats(dashStats);
            } else if (activeTab === "companies") {
                const companiesData = await getAllCompanies();
                setCompanies(companiesData || []);
            } else if (activeTab === "users") {
                const usersData = await getAllUsers();
                setUsers(usersData || []);
            } else if (activeTab === "plans") {
                const plansData = await getAllPlans();
                setPlans(plansData || []);
            } else if (activeTab === "addons") {
                const addonsData = await getAllAddons();
                setAddons(addonsData || []);
            } else if (activeTab === "audit") {
                const logsData = await getAuditLogs({ limit: 50 });
                setAuditLogs(logsData || []);
            } else if (activeTab === "roles") {
                const rolesData = await getAllRoles();
                const permissionsData = await getAllPermissions();
                setRoles(rolesData || []);
                setPermissions(permissionsData || []);
                if (rolesData && rolesData.length > 0 && !selectedRole) {
                    setSelectedRole(rolesData[0]);
                    const rolePerms = await getRolePermissions(rolesData[0].id);
                    setRolePermissions(rolePerms || []);
                }
            }
        } catch (err) {
            console.error("Error loading admin data:", err);
            setError(err instanceof Error ? err.message : "Failed to load data");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            loadData();
            return;
        }

        try {
            setLoading(true);
            if (activeTab === "companies") {
                const results = await searchCompanies(searchQuery);
                setCompanies(results || []);
            } else if (activeTab === "users") {
                const results = await searchUsers(searchQuery);
                setUsers(results || []);
            }
        } catch (err) {
            console.error("Search error:", err);
            setError("Search failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = async (role: any) => {
        setSelectedRole(role);
        try {
            const rolePerms = await getRolePermissions(role.id);
            setRolePermissions(rolePerms || []);
        } catch (err) {
            console.error("Error loading role permissions:", err);
        }
    };

    const handleTogglePermission = async (permissionId: string, currentlyAssigned: boolean) => {
        if (!selectedRole) return;

        try {
            setError("");
            if (currentlyAssigned) {
                await removePermissionFromRole(selectedRole.id, permissionId);
                setSuccess("Permission removed");
            } else {
                await assignPermissionToRole(selectedRole.id, permissionId);
                setSuccess("Permission assigned");
            }

            const rolePerms = await getRolePermissions(selectedRole.id);
            setRolePermissions(rolePerms || []);
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update permission");
        }
    };

    const isPermissionAssigned = (permissionId: string) => {
        return rolePermissions.some((rp: any) => rp.permission_id === permissionId);
    };

    const groupPermissionsByCategory = () => {
        const grouped: { [key: string]: any[] } = {};
        permissions.forEach((perm) => {
            const category = perm.category || "Other";
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(perm);
        });
        return grouped;
    };

    const handleCreateRole = async () => {
        if (!newRole.name) {
            setError("Role name is required");
            return;
        }

        try {
            setError("");
            await createRole(newRole);
            setSuccess("Role created successfully");
            setCreateRoleOpen(false);
            setNewRole({ name: "", display_name: "", description: "" });
            await loadData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create role");
        }
    };

    const handleUpdateRole = async () => {
        if (!roleToEdit) return;

        try {
            setError("");
            await updateRole(roleToEdit.id, {
                name: roleToEdit.name,
                display_name: roleToEdit.display_name,
                description: roleToEdit.description
            });
            setSuccess("Role updated successfully");
            setEditRoleOpen(false);
            setRoleToEdit(null);
            await loadData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update role");
        }
    };

    const handleDeleteRole = async () => {
        if (!roleToDelete) return;

        try {
            setError("");
            await deleteRole(roleToDelete.id);
            setSuccess("Role deleted successfully");
            setDeleteRoleOpen(false);
            setRoleToDelete(null);
            if (selectedRole?.id === roleToDelete.id) {
                setSelectedRole(null);
            }
            await loadData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete role");
        }
    };

    const handleCreatePermission = async () => {
        if (!newPermission.name) {
            setError("Permission name is required");
            return;
        }

        try {
            setError("");
            await createPermission(newPermission);
            setSuccess("Permission created successfully");
            setCreatePermissionOpen(false);
            setNewPermission({ name: "", category: "", description: "" });
            await loadData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create permission");
        }
    };

    const handleUpdatePermission = async () => {
        if (!permissionToEdit) return;

        try {
            setError("");
            await updatePermission(permissionToEdit.id, {
                name: permissionToEdit.name,
                category: permissionToEdit.category,
                description: permissionToEdit.description
            });
            setSuccess("Permission updated successfully");
            setEditPermissionOpen(false);
            setPermissionToEdit(null);
            await loadData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to update permission");
        }
    };

    const handleDeletePermission = async () => {
        if (!permissionToDelete) return;

        try {
            setError("");
            await deletePermission(permissionToDelete.id);
            setSuccess("Permission deleted successfully");
            setDeletePermissionOpen(false);
            setPermissionToDelete(null);
            await loadData();
            setTimeout(() => setSuccess(""), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete permission");
        }
    };

    const handleTabChange = (newTab: string) => {
        setActiveTab(newTab);
        router.push(`/admin?tab=${newTab}`, undefined, { shallow: true });
    };

    return (
        <ProtectedRoute>
            <AdminLayout activeTab={activeTab} onTabChange={handleTabChange}>
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Platform Administration</h1>
                            <p className="text-muted-foreground">Manage companies, users, plans, alerts, and platform settings</p>
                        </div>
                        <Badge variant="outline" className="px-3 py-1">
                            <Shield className="w-3 h-3 mr-1" />
                            Super Admin
                        </Badge>
                    </div>

                    {error && (
                        <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {success && (
                        <Alert className="border-green-500 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">{success}</AlertDescription>
                        </Alert>
                    )}

                    <Tabs value={activeTab} onValueChange={handleTabChange}>
                        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 lg:w-auto">
                            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                            <TabsTrigger value="control">Control</TabsTrigger>
                            <TabsTrigger value="companies">Companies</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                            <TabsTrigger value="plans">Plans</TabsTrigger>
                            <TabsTrigger value="addons">Add-ons</TabsTrigger>
                            <TabsTrigger value="roles">Roles</TabsTrigger>
                            <TabsTrigger value="audit">Audit</TabsTrigger>
                        </TabsList>


                        <TabsContent value="control" className="space-y-6">
                            <ControlCenterPanel data={controlCenterData} loading={loading} />
                        </TabsContent>

                        {/* Dashboard Tab */}
                        <TabsContent value="dashboard" className="space-y-6">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading dashboard...</p>
                                </div>
                            ) : stats ? (
                                <>
                                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.totalCompanies}</div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {stats.activeCompanies} active • {stats.inactiveCompanies} inactive
                                                </p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                                <Users className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                                                <p className="text-xs text-muted-foreground mt-1">Platform users</p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium">Active Trials</CardTitle>
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.trialCompanies}</div>
                                                <p className="text-xs text-muted-foreground mt-1">Free trials</p>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium">Paid Subscriptions</CardTitle>
                                                <CreditCard className="h-4 w-4 text-muted-foreground" />
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-2xl font-bold">{stats.paidCompanies}</div>
                                                <p className="text-xs text-muted-foreground mt-1">Active</p>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {stats.alerts && stats.alerts.length > 0 && (
                                        <Card>
                                            <CardHeader>
                                                <CardTitle className="flex items-center gap-2">
                                                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                                    Alerts & Warnings
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-2">
                                                {stats.alerts.map((alert: any, idx: number) => (
                                                    <div key={idx} className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                                                        <p className="text-sm text-yellow-800">{alert.message}</p>
                                                    </div>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    )}

                                    <div className="grid gap-4 md:grid-cols-2">
                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Recent Signups</CardTitle>
                                                <CardDescription>Last 7 days</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {!stats.recentSignups || stats.recentSignups.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No recent signups</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {stats.recentSignups.map((company: any) => (
                                                            <div key={company.id} className="flex justify-between items-center">
                                                                <span className="text-sm font-medium">{company.name}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(company.created_at).toLocaleDateString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader>
                                                <CardTitle>Recent Activity</CardTitle>
                                                <CardDescription>Latest changes</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {!stats.recentChanges || stats.recentChanges.length === 0 ? (
                                                    <p className="text-sm text-muted-foreground">No recent activity</p>
                                                ) : (
                                                    <div className="space-y-2">
                                                        {stats.recentChanges.slice(0, 5).map((log: any) => (
                                                            <div key={log.id} className="text-sm">
                                                                <span className="font-medium">{log.action}</span>
                                                                <span className="text-muted-foreground text-xs ml-2">
                                                                    by {log.user?.full_name || "System"}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    No dashboard data available
                                </div>
                            )}
                        </TabsContent>

                        {/* Companies Tab */}
                        <TabsContent value="companies" className="space-y-4">
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        placeholder="Search companies..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="max-w-sm"
                                    />
                                    <Button variant="outline" onClick={handleSearch}>
                                        <Search className="w-4 h-4" />
                                    </Button>
                                    {searchQuery && (
                                        <Button variant="ghost" onClick={() => { setSearchQuery(""); loadData(); }}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <Link href="/admin/companies/new">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create Company
                                    </Button>
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading companies...</p>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {companies.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    {searchQuery ? "No companies found matching your search" : "No companies found"}
                                                </div>
                                            ) : (
                                                companies.map((company) => (
                                                    <div key={company.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <h3 className="font-semibold">{company.name}</h3>
                                                                <p className="text-sm text-muted-foreground">{company.email}</p>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <Badge variant={company.is_active ? "default" : "secondary"}>
                                                                        {company.is_active ? "Active" : "Inactive"}
                                                                    </Badge>
                                                                    {company.subscription && (
                                                                        <Badge variant="outline">
                                                                            {company.subscription.status || "No subscription"}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Link href={`/admin/companies/${company.id}`}>
                                                                    <Button variant="ghost" size="sm">View</Button>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Users Tab */}
                        <TabsContent value="users" className="space-y-4">
                            <div className="flex justify-between items-center gap-4">
                                <div className="flex-1 flex gap-2">
                                    <Input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="max-w-sm"
                                    />
                                    <Button variant="outline" onClick={handleSearch}>
                                        <Search className="w-4 h-4" />
                                    </Button>
                                    {searchQuery && (
                                        <Button variant="ghost" onClick={() => { setSearchQuery(""); loadData(); }}>
                                            Clear
                                        </Button>
                                    )}
                                </div>
                                <Link href="/admin/users/new">
                                    <Button>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Create User
                                    </Button>
                                </Link>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading users...</p>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {users.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    {searchQuery ? "No users found matching your search" : "No users found"}
                                                </div>
                                            ) : (
                                                users.map((user) => (
                                                    <div key={user.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-center justify-between">
                                                            <div>
                                                                <h3 className="font-semibold">{user.full_name}</h3>
                                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {user.company?.name || "No company"}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Badge variant="outline">
                                                                    {user.role?.display_name || user.role?.name || "No role"}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        {/* Plans Tab */}
                        <TabsContent value="plans" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Subscription Plans</h2>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading plans...</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {plans.length === 0 ? (
                                        <div className="col-span-full p-8 text-center text-muted-foreground">
                                            No plans found
                                        </div>
                                    ) : (
                                        plans.map((plan) => (
                                            <Card key={plan.id}>
                                                <CardHeader>
                                                    <CardTitle>{plan.name}</CardTitle>
                                                    <CardDescription>{plan.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="text-2xl font-bold">
                                                            ${plan.price_monthly}
                                                            <span className="text-sm font-normal text-muted-foreground">/month</span>
                                                        </div>
                                                        <Badge variant={plan.is_active ? "default" : "secondary"}>
                                                            {plan.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Add-ons Tab */}
                        <TabsContent value="addons" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Add-ons</h2>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading add-ons...</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                    {addons.length === 0 ? (
                                        <div className="col-span-full p-8 text-center text-muted-foreground">
                                            No add-ons found
                                        </div>
                                    ) : (
                                        addons.map((addon) => (
                                            <Card key={addon.id}>
                                                <CardHeader>
                                                    <CardTitle>{addon.display_name || addon.name}</CardTitle>
                                                    <CardDescription>{addon.description}</CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-2">
                                                        <div className="text-2xl font-bold">
                                                            ${addon.price_monthly}
                                                            <span className="text-sm font-normal text-muted-foreground">
                                                                /{addon.addon_type === 'usage' ? addon.usage_unit : 'month'}
                                                            </span>
                                                        </div>
                                                        <Badge variant={addon.is_active ? "default" : "secondary"}>
                                                            {addon.is_active ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            )}
                        </TabsContent>

                        {/* Roles & Permissions Tab */}
                        <TabsContent value="roles" className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-semibold">Roles & Permissions</h2>
                                <div className="flex gap-2">
                                    <Dialog open={createPermissionOpen} onOpenChange={setCreatePermissionOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline">
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Permission
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Permission</DialogTitle>
                                                <DialogDescription>Add a new permission to the system</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Permission Name *</Label>
                                                    <Input
                                                        placeholder="e.g., view_reports"
                                                        value={newPermission.name}
                                                        onChange={(e) => setNewPermission({ ...newPermission, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Category</Label>
                                                    <Input
                                                        placeholder="e.g., Reports"
                                                        value={newPermission.category}
                                                        onChange={(e) => setNewPermission({ ...newPermission, category: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        placeholder="What does this permission allow?"
                                                        value={newPermission.description}
                                                        onChange={(e) => setNewPermission({ ...newPermission, description: e.target.value })}
                                                    />
                                                </div>
                                                <Button className="w-full" onClick={handleCreatePermission}>
                                                    Create Permission
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>

                                    <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
                                        <DialogTrigger asChild>
                                            <Button>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Role
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Create New Role</DialogTitle>
                                                <DialogDescription>Add a new user role to the system</DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div className="space-y-2">
                                                    <Label>Role Name *</Label>
                                                    <Input
                                                        placeholder="e.g., workshop_manager"
                                                        value={newRole.name}
                                                        onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Display Name</Label>
                                                    <Input
                                                        placeholder="e.g., Workshop Manager"
                                                        value={newRole.display_name}
                                                        onChange={(e) => setNewRole({ ...newRole, display_name: e.target.value })}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Textarea
                                                        placeholder="What is this role for?"
                                                        value={newRole.description}
                                                        onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                                    />
                                                </div>
                                                <Button className="w-full" onClick={handleCreateRole}>
                                                    Create Role
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading roles...</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 md:grid-cols-3">
                                    {/* Left: Role List */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Roles</CardTitle>
                                            <CardDescription>Select a role to manage permissions</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {roles.length === 0 ? (
                                                <p className="text-sm text-muted-foreground text-center py-4">No roles found</p>
                                            ) : (
                                                roles.map((role) => (
                                                    <div key={role.id} className="flex items-center gap-2">
                                                        <Button
                                                            variant={selectedRole?.id === role.id ? "secondary" : "ghost"}
                                                            className="flex-1 justify-start"
                                                            onClick={() => handleSelectRole(role)}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            <div className="text-left flex-1">
                                                                <div className="font-medium">{role.display_name || role.name}</div>
                                                                <div className="text-xs text-muted-foreground truncate">{role.description}</div>
                                                            </div>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setRoleToEdit({ ...role });
                                                                setEditRoleOpen(true);
                                                            }}
                                                        >
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => {
                                                                setRoleToDelete(role);
                                                                setDeleteRoleOpen(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))
                                            )}
                                        </CardContent>
                                    </Card>

                                    {/* Right: Permissions Matrix */}
                                    <Card className="md:col-span-2">
                                        <CardHeader>
                                            <CardTitle>
                                                {selectedRole ? `Permissions for ${selectedRole.display_name || selectedRole.name}` : "Select a Role"}
                                            </CardTitle>
                                            <CardDescription>
                                                {selectedRole ? "Check permissions to assign, uncheck to remove" : "Choose a role from the list to manage permissions"}
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            {!selectedRole ? (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    Select a role to manage permissions
                                                </div>
                                            ) : permissions.length === 0 ? (
                                                <div className="text-center py-12 text-muted-foreground">
                                                    No permissions found
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {Object.entries(groupPermissionsByCategory()).map(([category, perms]) => (
                                                        <div key={category} className="space-y-3">
                                                            <h3 className="font-semibold text-sm uppercase text-muted-foreground">{category}</h3>
                                                            <div className="grid gap-3 md:grid-cols-2">
                                                                {perms.map((permission) => {
                                                                    const assigned = isPermissionAssigned(permission.id);
                                                                    return (
                                                                        <div
                                                                            key={permission.id}
                                                                            className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                                                                            onClick={() => handleTogglePermission(permission.id, assigned)}
                                                                        >
                                                                            <Checkbox
                                                                                checked={assigned}
                                                                                onCheckedChange={() => handleTogglePermission(permission.id, assigned)}
                                                                            />
                                                                            <div className="flex-1">
                                                                                <div className="font-medium text-sm">{permission.name}</div>
                                                                                <div className="text-xs text-muted-foreground">{permission.description}</div>
                                                                            </div>
                                                                            <div className="flex gap-1">
                                                                                {assigned ? (
                                                                                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                                                                                ) : (
                                                                                    <XCircle className="h-4 w-4 text-muted-foreground" />
                                                                                )}
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="h-6 w-6"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        setPermissionToEdit({ ...permission });
                                                                                        setEditPermissionOpen(true);
                                                                                    }}
                                                                                >
                                                                                    <Edit className="h-3 w-3" />
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </TabsContent>

                        {/* Audit Logs Tab */}
                        <TabsContent value="audit" className="space-y-4">
                            <h2 className="text-xl font-semibold">Audit Logs</h2>

                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                                    <p className="text-muted-foreground">Loading audit logs...</p>
                                </div>
                            ) : (
                                <Card>
                                    <CardContent className="p-0">
                                        <div className="divide-y">
                                            {auditLogs.length === 0 ? (
                                                <div className="p-8 text-center text-muted-foreground">
                                                    No audit logs found
                                                </div>
                                            ) : (
                                                auditLogs.map((log) => (
                                                    <div key={log.id} className="p-4 hover:bg-muted/50 transition-colors">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2">
                                                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                                                    <span className="font-medium">{log.action}</span>
                                                                    <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    By {log.user?.full_name || "System"} • {log.company?.name || "Platform"}
                                                                </p>
                                                                {log.metadata && (
                                                                    <pre className="text-xs mt-2 p-2 bg-muted rounded max-w-2xl overflow-auto">
                                                                        {JSON.stringify(log.metadata, null, 2)}
                                                                    </pre>
                                                                )}
                                                            </div>
                                                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                                                                {new Date(log.created_at).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>
                    </Tabs>

                    {/* Edit Role Dialog */}
                    <Dialog open={editRoleOpen} onOpenChange={setEditRoleOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Role</DialogTitle>
                                <DialogDescription>Update role details</DialogDescription>
                            </DialogHeader>
                            {roleToEdit && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Role Name *</Label>
                                        <Input
                                            value={roleToEdit.name}
                                            onChange={(e) => setRoleToEdit({ ...roleToEdit, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Display Name</Label>
                                        <Input
                                            value={roleToEdit.display_name || ""}
                                            onChange={(e) => setRoleToEdit({ ...roleToEdit, display_name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={roleToEdit.description || ""}
                                            onChange={(e) => setRoleToEdit({ ...roleToEdit, description: e.target.value })}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={handleUpdateRole}>
                                        Update Role
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Delete Role Dialog */}
                    <Dialog open={deleteRoleOpen} onOpenChange={setDeleteRoleOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Role</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the role "{roleToDelete?.display_name || roleToDelete?.name}"? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setDeleteRoleOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeleteRole}>
                                    Delete Role
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Edit Permission Dialog */}
                    <Dialog open={editPermissionOpen} onOpenChange={setEditPermissionOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Edit Permission</DialogTitle>
                                <DialogDescription>Update permission details</DialogDescription>
                            </DialogHeader>
                            {permissionToEdit && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Permission Name *</Label>
                                        <Input
                                            value={permissionToEdit.name}
                                            onChange={(e) => setPermissionToEdit({ ...permissionToEdit, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Category</Label>
                                        <Input
                                            value={permissionToEdit.category || ""}
                                            onChange={(e) => setPermissionToEdit({ ...permissionToEdit, category: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Description</Label>
                                        <Textarea
                                            value={permissionToEdit.description || ""}
                                            onChange={(e) => setPermissionToEdit({ ...permissionToEdit, description: e.target.value })}
                                        />
                                    </div>
                                    <Button className="w-full" onClick={handleUpdatePermission}>
                                        Update Permission
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>

                    {/* Delete Permission Dialog */}
                    <Dialog open={deletePermissionOpen} onOpenChange={setDeletePermissionOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Delete Permission</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to delete the permission "{permissionToDelete?.name}"? This will remove it from all roles. This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex gap-2 justify-end">
                                <Button variant="outline" onClick={() => setDeletePermissionOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" onClick={handleDeletePermission}>
                                    Delete Permission
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </AdminLayout>
        </ProtectedRoute>
    );
}