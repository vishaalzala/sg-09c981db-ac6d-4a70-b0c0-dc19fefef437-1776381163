import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AdminLayout } from "@/components/AdminLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  getCompanyById, 
  updateCompany, 
  getAllPlans,
  assignPlanToCompany,
  getAllAddons,
  assignAddonToCompany,
  removeAddonFromCompany,
  toggleAddon,
  type CompanyWithDetails
} from "@/services/adminService";
import { 
  ArrowLeft, 
  Edit, 
  Save, 
  X, 
  Building2, 
  CreditCard, 
  Puzzle, 
  Users, 
  MapPin,
  History,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default function CompanyDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [company, setCompany] = useState<CompanyWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    is_active: true
  });

  // Subscription management
  const [plans, setPlans] = useState<any[]>([]);
  const [addons, setAddons] = useState<any[]>([]);
  const [changingPlan, setChangingPlan] = useState(false);

  useEffect(() => {
    if (id) {
      loadCompanyData();
      loadPlans();
      loadAddons();
    }
  }, [id]);

  const loadCompanyData = async () => {
    try {
      setLoading(true);
      const data = await getCompanyById(id as string);
      setCompany(data);
      setEditForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        address: data.address || "",
        is_active: data.is_active ?? true
      });
    } catch (err) {
      setError("Failed to load company details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async () => {
    try {
      const data = await getAllPlans();
      setPlans(data || []);
    } catch (err) {
      console.error("Failed to load plans:", err);
    }
  };

  const loadAddons = async () => {
    try {
      const data = await getAllAddons();
      setAddons(data || []);
    } catch (err) {
      console.error("Failed to load add-ons:", err);
    }
  };

  const handleSaveCompany = async () => {
    try {
      setSaving(true);
      setError("");
      await updateCompany(id as string, editForm);
      setSuccess("Company updated successfully");
      setEditMode(false);
      await loadCompanyData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update company");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePlan = async (planId: string) => {
    try {
      setChangingPlan(true);
      setError("");
      await assignPlanToCompany(id as string, planId);
      setSuccess("Plan updated successfully");
      await loadCompanyData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change plan");
    } finally {
      setChangingPlan(false);
    }
  };

  const handleToggleAddon = async (addonId: string, currentlyEnabled: boolean) => {
    try {
      setError("");
      if (currentlyEnabled) {
        await removeAddonFromCompany(id as string, addonId);
        setSuccess("Add-on disabled");
      } else {
        await assignAddonToCompany(id as string, addonId);
        setSuccess("Add-on enabled");
      }
      await loadCompanyData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update add-on");
    }
  };

  const getStatusBadge = (status: string | undefined) => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
    
    const statusMap: Record<string, { variant: any; label: string; icon: any }> = {
      trial_active: { variant: "default", label: "Trial Active", icon: Clock },
      trial_expired: { variant: "destructive", label: "Trial Expired", icon: XCircle },
      active: { variant: "default", label: "Active", icon: CheckCircle2 },
      canceled: { variant: "secondary", label: "Canceled", icon: XCircle },
      past_due: { variant: "destructive", label: "Past Due", icon: AlertCircle }
    };

    const config = statusMap[status] || { variant: "secondary", label: status, icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="super_admin">
        <AdminLayout>
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading company details...</p>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!company) {
    return (
      <ProtectedRoute requiredRole="super_admin">
        <AdminLayout>
          <div className="p-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>Company not found</AlertDescription>
            </Alert>
            <Link href="/admin">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
            </Link>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  const companyAddons = company.addons || [];
  const isAddonEnabled = (addonId: string) => {
    return companyAddons.some((ca: any) => ca.addon_id === addonId && ca.is_enabled);
  };

  return (
    <ProtectedRoute requiredRole="super_admin">
      <AdminLayout>
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold">{company.name}</h1>
                <p className="text-muted-foreground">{company.email}</p>
              </div>
            </div>
            <Badge variant={company.is_active ? "default" : "secondary"}>
              {company.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>

          {/* Alerts */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">{success}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="profile" className="space-y-4">
            <TabsList>
              <TabsTrigger value="profile">
                <Building2 className="w-4 h-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="subscription">
                <CreditCard className="w-4 h-4 mr-2" />
                Subscription
              </TabsTrigger>
              <TabsTrigger value="addons">
                <Puzzle className="w-4 h-4 mr-2" />
                Add-ons
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="w-4 h-4 mr-2" />
                Users
              </TabsTrigger>
              <TabsTrigger value="branches">
                <MapPin className="w-4 h-4 mr-2" />
                Branches
              </TabsTrigger>
              <TabsTrigger value="activity">
                <History className="w-4 h-4 mr-2" />
                Activity
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Company Profile</CardTitle>
                      <CardDescription>Basic company information and settings</CardDescription>
                    </div>
                    {!editMode ? (
                      <Button onClick={() => setEditMode(true)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                    ) : (
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                          setEditMode(false);
                          setEditForm({
                            name: company.name || "",
                            email: company.email || "",
                            phone: company.phone || "",
                            address: company.address || "",
                            is_active: company.is_active ?? true
                          });
                        }}>
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                        <Button onClick={handleSaveCompany} disabled={saving}>
                          <Save className="w-4 h-4 mr-2" />
                          {saving ? "Saving..." : "Save"}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      {editMode ? (
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm font-medium">{company.name}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Email</Label>
                      {editMode ? (
                        <Input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm">{company.email || "—"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Phone</Label>
                      {editMode ? (
                        <Input
                          type="tel"
                          value={editForm.phone || ""}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        />
                      ) : (
                        <p className="text-sm">{company.phone || "—"}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      {editMode ? (
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={editForm.is_active}
                            onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                          />
                          <span className="text-sm">{editForm.is_active ? "Active" : "Inactive"}</span>
                        </div>
                      ) : (
                        <Badge variant={company.is_active ? "default" : "secondary"}>
                          {company.is_active ? "Active" : "Inactive"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Address</Label>
                    {editMode ? (
                      <Textarea
                        value={editForm.address || ""}
                        onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm">{company.address || "—"}</p>
                    )}
                  </div>

                  <div className="pt-4 border-t">
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Company ID:</span>
                        <span className="font-mono text-xs">{company.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Created:</span>
                        <span>{new Date(company.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Updated:</span>
                        <span>{new Date(company.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription">
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                  <CardDescription>Manage plan and billing for this company</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {company.subscription ? (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Current Plan</Label>
                          <div className="flex items-center gap-2">
                            <p className="text-lg font-semibold">
                              {company.subscription.plan?.name || "No Plan"}
                            </p>
                            {getStatusBadge(company.subscription.status)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Billing Cycle</Label>
                          <p className="text-sm capitalize">
                            {company.subscription.billing_cycle || "—"}
                          </p>
                        </div>

                        {company.subscription.status === "trial_active" && company.subscription.trial_ends_at && (
                          <div className="space-y-2">
                            <Label>Trial Ends</Label>
                            <p className="text-sm">
                              {new Date(company.subscription.trial_ends_at).toLocaleDateString()}
                              {" "}
                              ({Math.ceil((new Date(company.subscription.trial_ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining)
                            </p>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Current Period</Label>
                          <p className="text-sm">
                            {company.subscription.current_period_start ? new Date(company.subscription.current_period_start).toLocaleDateString() : "—"}
                            {" → "}
                            {company.subscription.current_period_end ? new Date(company.subscription.current_period_end).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Label className="mb-3 block">Change Plan</Label>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                          {plans.map((plan) => (
                            <Card 
                              key={plan.id}
                              className={company.subscription?.plan_id === plan.id ? "border-primary" : ""}
                            >
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{plan.name}</CardTitle>
                                <CardDescription className="text-sm">
                                  ${plan.price_monthly || 0}/month
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {company.subscription?.plan_id === plan.id ? (
                                  <Badge variant="secondary" className="w-full justify-center">
                                    Current Plan
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="w-full"
                                    onClick={() => handleChangePlan(plan.id)}
                                    disabled={changingPlan}
                                  >
                                    Switch to This
                                  </Button>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No subscription found. Assign a plan to activate this company.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Add-ons Tab */}
            <TabsContent value="addons">
              <Card>
                <CardHeader>
                  <CardTitle>Add-ons Management</CardTitle>
                  <CardDescription>Enable or disable features for this company</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    {addons.map((addon) => {
                      const enabled = isAddonEnabled(addon.id);
                      return (
                        <Card key={addon.id} className={enabled ? "border-primary" : ""}>
                          <CardHeader className="pb-3">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <CardTitle className="text-base">{addon.display_name || addon.name}</CardTitle>
                                <CardDescription className="text-sm">
                                  ${addon.price_monthly || 0}
                                  {addon.addon_type === "usage" ? `/${addon.usage_unit || "use"}` : "/month"}
                                </CardDescription>
                              </div>
                              <Switch
                                checked={enabled}
                                onCheckedChange={() => handleToggleAddon(addon.id, enabled)}
                              />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-muted-foreground">{addon.description}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Users Tab */}
            <TabsContent value="users">
              <Card>
                <CardHeader>
                  <CardTitle>Company Users</CardTitle>
                  <CardDescription>Users with access to this company</CardDescription>
                </CardHeader>
                <CardContent>
                  {company.users && company.users.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Role</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {company.users.map((user: any) => (
                          <TableRow key={user.id}>
                            <TableCell className="font-medium">{user.full_name || "—"}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {user.role?.display_name || user.role?.name || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No users found for this company</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Branches Tab */}
            <TabsContent value="branches">
              <Card>
                <CardHeader>
                  <CardTitle>Branches</CardTitle>
                  <CardDescription>Physical locations for this company</CardDescription>
                </CardHeader>
                <CardContent>
                  {company.branches && company.branches.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {company.branches.map((branch: any) => (
                        <Card key={branch.id}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <CardTitle className="text-base">{branch.name}</CardTitle>
                              <Badge variant={branch.is_active ? "default" : "secondary"}>
                                {branch.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-2 text-sm">
                            {branch.email && (
                              <div>
                                <span className="text-muted-foreground">Email: </span>
                                {branch.email}
                              </div>
                            )}
                            {branch.phone && (
                              <div>
                                <span className="text-muted-foreground">Phone: </span>
                                {branch.phone}
                              </div>
                            )}
                            {branch.address && (
                              <div>
                                <span className="text-muted-foreground">Address: </span>
                                {branch.address}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>No branches found for this company</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Audit trail and changes for this company</CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Activity logging is being collected. View full audit logs in the Audit tab.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}