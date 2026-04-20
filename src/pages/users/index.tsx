import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, Plus, Edit, Trash2, Shield, Mail, Building2, Search
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { companyService } from "@/services/companyService";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { cn } from "@/lib/utils";
import { permissionService } from "@/services/permissionService";

interface User {
  id: string;
  full_name: string;
  email: string;
  mobile?: string;
  role_id: string;
  branch_id?: string;
  is_active: boolean;
  roles?: { name: string; display_name?: string };
  branches?: { name: string };
}

interface Role {
  id: string;
  name: string;
  display_name: string;
}

interface Branch {
  id: string;
  name: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [canManageUsers, setCanManageUsers] = useState(false);

  const [inviteForm, setInviteForm] = useState<{
    email: string;
    full_name: string;
    mobile: string;
    role_id: string;
    branch_id: string;
  }>({
    email: "",
    full_name: "",
    mobile: "",
    role_id: "",
    branch_id: ""
  });

  const [editForm, setEditForm] = useState({
    full_name: "",
    mobile: "",
    role_id: "",
    branch_id: "",
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Check permissions
    const canManage = await permissionService.canManageUsers();
    setCanManageUsers(canManage);

    if (!canManage) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to manage users",
        variant: "destructive"
      });
      router.push("/dashboard");
      return;
    }

    const company = await companyService.getCurrentCompany();
    if (!company) {
      router.push("/login");
      return;
    }

    setCompanyId(company.id);
    setCompanyName(company.name || "");

    await Promise.all([
      loadUsers(company.id),
      loadRoles(),
      loadBranches(company.id)
    ]);

    setLoading(false);
  };

  const loadUsers = async (cId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        roles(name, display_name),
        branches(name)
      `)
      .eq("company_id", cId)
      .order("full_name") as any;

    if (error) {
      console.error("Error loading users:", error);
      return;
    }

    // Handle potential array or single object for relations
    const mappedUsers = (data || []).map((u: any) => ({
      ...u,
      roles: Array.isArray(u.roles) ? u.roles[0] : u.roles,
      branches: Array.isArray(u.branches) ? u.branches[0] : u.branches
    }));

    setUsers(mappedUsers);
  };

  const loadRoles = async () => {
    const { data } = await supabase
      .from("roles")
      .select("id, name, display_name")
      .order("display_name");

    setRoles(data || []);
  };

  const loadBranches = async (cId: string) => {
    const { data } = await supabase
      .from("branches")
      .select("id, name")
      .eq("company_id", cId)
      .eq("is_active", true)
      .order("name");

    setBranches(data || []);
  };

  const handleInviteUser = async () => {
    if (!companyId || !inviteForm.email || !inviteForm.role_id) {
      toast({
        title: "Validation Error",
        description: "Email and role are required",
        variant: "destructive"
      });
      return;
    }

    // Validate company access
    const hasAccess = await companyService.validateUserCompanyAccess(
      (await supabase.auth.getUser()).data.user?.id || "",
      companyId
    );

    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to add users to this company",
        variant: "destructive"
      });
      return;
    }

    // Create user via admin API
    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: inviteForm.email,
        full_name: inviteForm.full_name,
        mobile: inviteForm.mobile,
        role_id: inviteForm.role_id,
        branch_id: inviteForm.branch_id || null,
        company_id: companyId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      toast({
        title: "Error",
        description: error.error || "Failed to create user",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "User invited successfully. They will receive an email to set their password."
    });

    setShowInviteDialog(false);
    setInviteForm({
      email: "",
      full_name: "",
      mobile: "",
      role_id: "",
      branch_id: ""
    });
    loadUsers(companyId);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    // Validate company access
    const hasAccess = await companyService.validateUserCompanyAccess(
      (await supabase.auth.getUser()).data.user?.id || "",
      companyId
    );

    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to edit users in this company",
        variant: "destructive"
      });
      return;
    }

    // Validate target user belongs to same company
    const { data: targetUser } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", selectedUser.id)
      .single();

    if (targetUser?.company_id !== companyId) {
      toast({
        title: "Access Denied",
        description: "This user does not belong to your company",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({
        full_name: editForm.full_name,
        mobile: editForm.mobile,
        role_id: editForm.role_id,
        branch_id: editForm.branch_id || null,
        is_active: editForm.is_active
      })
      .eq("id", selectedUser.id)
      .eq("company_id", companyId); // Extra safety check

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "User updated successfully"
    });

    setShowEditDialog(false);
    setSelectedUser(null);
    loadUsers(companyId);
  };

  const handleDeactivateUser = async (userId: string) => {
    // Validate company access
    const hasAccess = await companyService.validateUserCompanyAccess(
      (await supabase.auth.getUser()).data.user?.id || "",
      companyId
    );

    if (!hasAccess) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to deactivate users in this company",
        variant: "destructive"
      });
      return;
    }

    // Validate target user belongs to same company
    const { data: targetUser } = await supabase
      .from("users")
      .select("company_id")
      .eq("id", userId)
      .single();

    if (targetUser?.company_id !== companyId) {
      toast({
        title: "Access Denied",
        description: "This user does not belong to your company",
        variant: "destructive"
      });
      return;
    }

    const { error } = await supabase
      .from("users")
      .update({ is_active: false })
      .eq("id", userId)
      .eq("company_id", companyId); // Extra safety check

    if (error) {
      toast({
        title: "Error",
        description: "Failed to deactivate user",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Success",
      description: "User deactivated successfully"
    });

    loadUsers(companyId);
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      full_name: user.full_name,
      mobile: user.mobile || "",
      role_id: user.role_id,
      branch_id: user.branch_id || "",
      is_active: user.is_active
    });
    setShowEditDialog(true);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.roles?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeUsers = users.filter(u => u.is_active).length;

  return (
    <AppLayout companyId={companyId} companyName={companyName}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              User Management
            </h1>
            <p className="text-muted-foreground mt-1">Manage team members, roles, and permissions</p>
          </div>
          <Button onClick={() => setShowInviteDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Invite User
          </Button>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <Users className="h-8 w-8 text-primary opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold">{activeUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-success opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Inactive</p>
                  <p className="text-2xl font-bold">{users.length - activeUsers}</p>
                </div>
                <Shield className="h-8 w-8 text-muted opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Roles</p>
                  <p className="text-2xl font-bold">{roles.length}</p>
                </div>
                <Shield className="h-8 w-8 text-secondary opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage user access and assign roles</CardDescription>
              </div>
            </div>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.full_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {user.roles?.display_name || user.roles?.name || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.branches ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          {user.branches.name}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">All Branches</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(
                        user.is_active ? "bg-success" : "bg-muted"
                      )}>
                        {user.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => openEditDialog(user)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {user.is_active && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDeactivateUser(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Invite User Dialog */}
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New User</DialogTitle>
              <DialogDescription>
                Send an invitation email to add a new team member
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={inviteForm.email}
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={inviteForm.full_name}
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input
                  value={inviteForm.mobile}
                  onChange={(e) => setInviteForm({ ...inviteForm, mobile: e.target.value })}
                  placeholder="+64 21 123 4567"
                />
              </div>
              <div>
                <Label>Role *</Label>
                <Select value={inviteForm.role_id} onValueChange={(v) => setInviteForm({ ...inviteForm, role_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Branch (Optional)</Label>
                <Select value={inviteForm.branch_id} onValueChange={(v) => setInviteForm({ ...inviteForm, branch_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteUser}>
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user role, branch assignment, and status
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Mobile</Label>
                <Input
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select value={editForm.role_id} onValueChange={(v) => setEditForm({ ...editForm, role_id: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(role => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Branch</Label>
                <Select value={editForm.branch_id} onValueChange={(v) => setEditForm({ ...editForm, branch_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="All branches" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All branches</SelectItem>
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between py-2">
                <Label>Status</Label>
                <Select 
                  value={editForm.is_active ? "active" : "inactive"} 
                  onValueChange={(v) => setEditForm({ ...editForm, is_active: v === "active" })}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditUser}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}