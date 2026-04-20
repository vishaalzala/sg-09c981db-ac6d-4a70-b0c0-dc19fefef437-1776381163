import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Wrench } from "lucide-react";
import Link from "next/link";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      console.log("Attempting login for:", email);

      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error("Auth error:", authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Login failed - no user returned");
      }

      console.log("Auth successful, user ID:", authData.user.id);

      // Wait a moment for session to be fully established
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fetch user role from profiles table
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role, email, full_name")
        .eq("id", authData.user.id)
        .single();

      if (profileError) {
        console.error("Profile query error:", profileError);
        if (profileError.code === "PGRST116") {
          throw new Error("User profile not found. Please contact support.");
        } else if (profileError.message.includes("permission")) {
          throw new Error("Database permission error. Please contact support.");
        } else {
          throw new Error(`Database error: ${profileError.message}`);
        }
      }

      if (!profile) {
        console.error("No profile found for user:", authData.user.id);
        throw new Error("User profile not found. Please contact support.");
      }

      console.log("Profile loaded:", { role: profile.role, email: profile.email });

      // Route based on role (profiles.role is source of truth)
      if (profile.role === "super_admin") {
        console.log("Redirecting super admin to /admin");
        router.push("/admin");
      } else {
        console.log("Redirecting user to /dashboard");
        router.push("/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO 
        title="Sign In - WorkshopPro"
        description="Sign in to your WorkshopPro account"
      />

      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary text-primary-foreground p-3 rounded-lg">
                <Wrench className="h-8 w-8" />
              </div>
            </div>
            <CardTitle className="text-3xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your WorkshopPro account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Start free trial
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}