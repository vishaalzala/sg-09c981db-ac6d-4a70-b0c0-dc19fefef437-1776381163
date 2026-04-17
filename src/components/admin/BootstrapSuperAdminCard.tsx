import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BootstrapStatus {
  hasSuperAdmin: boolean;
  serviceRoleConfigured: boolean;
}

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  const token = data.session?.access_token;
  if (!token) throw new Error("NOT_AUTHENTICATED");
  return token;
}

export function BootstrapSuperAdminCard() {
  const { toast } = useToast();
  const [status, setStatus] = useState<BootstrapStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const [bootstrapToken, setBootstrapToken] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoadingStatus(true);

    fetch("/api/admin/bootstrap-status")
      .then(async (res) => (await res.json()) as BootstrapStatus)
      .then((data) => {
        if (cancelled) return;
        setStatus(data);
      })
      .catch(() => {
        if (cancelled) return;
        setStatus({ hasSuperAdmin: true, serviceRoleConfigured: false });
      })
      .finally(() => {
        if (cancelled) return;
        setLoadingStatus(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const onBootstrap = async () => {
    if (!bootstrapToken.trim()) {
      toast({ title: "Bootstrap token", description: "Enter the bootstrap token", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    try {
      const token = await getAccessToken();
      const res = await fetch("/api/admin/bootstrap-super-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bootstrapToken }),
      });

      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        throw new Error(json.error ?? "Bootstrap failed");
      }

      toast({
        title: "Super Admin enabled",
        description: "You can now access /admin and create users.",
      });

      window.location.reload();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Bootstrap failed";
      toast({ title: "Bootstrap failed", description: message, variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingStatus || !status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin bootstrap</CardTitle>
          <CardDescription>Checking system status…</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!status.serviceRoleConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin bootstrap unavailable</CardTitle>
          <CardDescription>
            Server is missing SUPABASE_SERVICE_ROLE_KEY, so Admin user creation + demo seeding cannot run.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (status.hasSuperAdmin) {
    return null;
  }

  return (
    <Card className="border-warning/50">
      <CardHeader>
        <CardTitle>Bootstrap first Super Admin</CardTitle>
        <CardDescription>
          No Super Admin exists yet. Enter the one-time bootstrap token to promote your current account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <Label htmlFor="bootstrap-token">Bootstrap token</Label>
          <Input
            id="bootstrap-token"
            value={bootstrapToken}
            onChange={(e) => setBootstrapToken(e.target.value)}
            placeholder="Paste token from Vercel env var ADMIN_BOOTSTRAP_TOKEN"
            disabled={submitting}
          />
        </div>
        <Button onClick={onBootstrap} disabled={submitting}>
          {submitting ? "Enabling…" : "Make me Super Admin"}
        </Button>
      </CardContent>
    </Card>
  );
}