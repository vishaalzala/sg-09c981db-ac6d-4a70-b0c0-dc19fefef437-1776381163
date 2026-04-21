import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";

interface CreateUserDialogProps {
  companyId?: string;
  companies?: { id: string; name: string }[];
  onUserCreated?: () => void;
}

export function CreateUserDialog({ companyId, companies = [], onUserCreated }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    role: "",
    companyId: companyId || companies[0]?.id || ""
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, companyId: companyId || prev.companyId || companies[0]?.id || "" }));
  }, [companyId, companies]);

  const availableRoles = [
    { value: "owner", label: "Owner" },
    { value: "branch_manager", label: "Branch Manager" },
    { value: "service_advisor", label: "Service Advisor" },
    { value: "technician", label: "Technician" },
    { value: "wof_inspector", label: "WOF Inspector" },
    { value: "parts_manager", label: "Parts Manager" },
    { value: "reception", label: "Reception" },
    { value: "accountant", label: "Accountant" }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      if (!formData.role) throw new Error("Please select a role");
      if (!formData.companyId) throw new Error("Please select a company");

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          companyId: formData.companyId,
          role: formData.role
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to create user");

      setSuccess(true);
      setFormData({ email: "", password: "", fullName: "", role: "", companyId: companyId || companies[0]?.id || "" });
      setTimeout(() => {
        setSuccess(false);
        setOpen(false);
        onUserCreated?.();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="w-4 h-4 mr-2" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>Add a new user to a company</DialogDescription>
        </DialogHeader>

        {success && (
          <Alert className="border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">User created successfully!</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!companyId && (
            <div className="space-y-2">
              <Label htmlFor="company">Company *</Label>
              <Select value={formData.companyId} onValueChange={(value) => setFormData({ ...formData, companyId: value })} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select a company" /></SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input id="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required minLength={8} disabled={loading} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })} disabled={loading}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                {availableRoles.map((role) => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating User...</> : "Create User"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
