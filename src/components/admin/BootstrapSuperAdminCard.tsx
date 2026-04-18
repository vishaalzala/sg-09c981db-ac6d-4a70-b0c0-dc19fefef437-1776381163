import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, AlertCircle, CheckCircle2 } from "lucide-react";

export function BootstrapSuperAdminCard() {
  const [status, setStatus] = useState<{
    roleExists: boolean;
    superAdminExists: boolean;
    count: number;
  } | null>(null);
  const [email, setEmail] = useState("vishaalzala@gmail.com");
  const [password, setPassword] = useState("");
  const [bootstrapToken, setBootstrapToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/admin/bootstrap-status");
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error("Status check failed:", err);
    }
  };

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/bootstrap-super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, bootstrapToken })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Bootstrap failed");
      }

      setSuccess("Super admin created successfully!");
      setPassword("");
      setBootstrapToken("");
      checkStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bootstrap failed");
    } finally {
      setLoading(false);
    }
  };

  if (!status) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Checking status...</p>
        </CardContent>
      </Card>
    );
  }

  if (status.superAdminExists) {
    return (
      <Card className="border-green-500">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle>Super Admin Configured</CardTitle>
          </div>
          <CardDescription>
            {status.count} super admin account(s) exist
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-amber-500">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-amber-600" />
          <CardTitle>Bootstrap Super Admin</CardTitle>
        </div>
        <CardDescription>
          Create the initial super admin account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 border-green-500 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleBootstrap} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Bootstrap Token</label>
            <Input
              type="password"
              placeholder="From .env.local"
              value={bootstrapToken}
              onChange={(e) => setBootstrapToken(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground">
              Use ADMIN_BOOTSTRAP_TOKEN from your .env.local file
            </p>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating..." : "Create Super Admin"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}