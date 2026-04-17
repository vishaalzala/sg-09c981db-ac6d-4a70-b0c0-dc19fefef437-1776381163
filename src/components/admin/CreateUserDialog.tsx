import { useEffect, useMemo, useState } from "react";
import { adminService, type AdminCompanyOption, type AdminCreateUserRole } from "@/services/adminService";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ROLE_LABELS: Record<AdminCreateUserRole, string> = {
  super_admin: "Super Admin",
  owner: "Owner",
  staff: "Staff",
  inspector: "WOF Inspector",
  service_advisor: "Service Advisor",
  technician: "Technician",
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

interface CreateUserDialogProps {
  triggerLabel?: string;
  defaultCompanyId?: string | null;
}

export function CreateUserDialog({ triggerLabel = "Create user", defaultCompanyId = null }: CreateUserDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);

  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companyOptions, setCompanyOptions] = useState<AdminCompanyOption[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<AdminCreateUserRole>("staff");
  const [companyId, setCompanyId] = useState<string | null>(defaultCompanyId);

  const needsCompany = role !== "super_admin";

  const sortedCompanies = useMemo(() => {
    return [...companyOptions].sort((a, b) => a.name.localeCompare(b.name));
  }, [companyOptions]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoadingCompanies(true);

    adminService
      .listCompanies()
      .then((companies) => {
        if (cancelled) return;
        setCompanyOptions(companies);
        if (!defaultCompanyId && !companyId && companies[0]?.id) {
          setCompanyId(companies[0].id);
        }
      })
      .catch((e) => {
        const message = e instanceof Error ? e.message : "Failed to load companies";
        toast({ title: "Companies", description: message, variant: "destructive" });
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingCompanies(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, toast, defaultCompanyId, companyId]);

  useEffect(() => {
    if (role === "super_admin") {
      setCompanyId(null);
    } else if (!companyId && defaultCompanyId) {
      setCompanyId(defaultCompanyId);
    }
  }, [role, companyId, defaultCompanyId]);

  const onSubmit = async () => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!fullName.trim()) {
      toast({ title: "Validation", description: "Full name is required", variant: "destructive" });
      return;
    }
    if (!isEmail(trimmedEmail)) {
      toast({ title: "Validation", description: "Email is invalid", variant: "destructive" });
      return;
    }
    if (!password || password.length < 8) {
      toast({ title: "Validation", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    if (needsCompany && !companyId) {
      toast({ title: "Validation", description: "Company is required for this role", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const created = await adminService.createUser({
        fullName: fullName.trim(),
        email: trimmedEmail,
        password,
        role,
        companyId: needsCompany ? companyId : null,
      });

      toast({
        title: "User created",
        description: `${created.email} (${ROLE_LABELS[role]}) can log in immediately.`,
      });

      setOpen(false);
      setFullName("");
      setEmail("");
      setPassword("");
      setRole("staff");
      setCompanyId(defaultCompanyId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Failed to create user";
      toast({ title: "Create user failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>{triggerLabel}</Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create user</DialogTitle>
          <DialogDescription>
            Creates a Supabase Auth account and links it to app tables (`profiles`, `users`). The user can log in immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="create-user-full-name">Full name</Label>
            <Input
              id="create-user-full-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g., Jamie Smith"
              disabled={submitting}
              autoComplete="name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-user-email">Email</Label>
            <Input
              id="create-user-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@workshop.co.nz"
              disabled={submitting}
              autoComplete="email"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="create-user-password">Temporary password</Label>
            <Input
              id="create-user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              disabled={submitting}
              autoComplete="new-password"
            />
          </div>

          <div className="grid gap-2">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as AdminCreateUserRole)} disabled={submitting}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ROLE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Company</Label>
            <Select
              value={companyId ?? ""}
              onValueChange={(v) => setCompanyId(v)}
              disabled={submitting || loadingCompanies || !needsCompany}
            >
              <SelectTrigger>
                <SelectValue placeholder={needsCompany ? "Select company" : "Not required for Super Admin"} />
              </SelectTrigger>
              <SelectContent>
                {sortedCompanies.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name} {c.is_active === false ? "(inactive)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={submitting}>
            {submitting ? "Creating..." : "Create user"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}