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
      console.log("Login attempt:", email);

      // Sign in with Supabase Auth
      const { data: result, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        console.error("Sign in error:", signInError);
        throw signInError;
      }

      if (!result.user) {
        throw new Error("No user returned from sign in");
      }

      console.log("Auth successful, user ID:", result.user.id);

      // Fetch role from profiles table ONLY (source of truth for authorization)
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", result.user.id)
        .single();

      if (profileError) {
        console.error("Profile fetch error:", profileError);
        throw new Error(`Failed to load user profile: ${profileError.message}`);
      }

      if (!profile) {
        throw new Error("User profile not found");
      }

      console.log("User role from profiles:", profile.role);

      // Route based on role from profiles table
      if (profile.role === "super_admin") {
        console.log("Redirecting to admin panel");
        router.push("/admin");
      } else {
        console.log("Redirecting to dashboard");
        router.push("/dashboard");
      }

    } catch (err) {
      console.error("Login error:", err);
      setError(err instanceof Error ? err.message : "Invalid email or password");
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

            {router.query.message && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <AlertDescription className="text-green-800">
                  {router.query.message}
                </AlertDescription>
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
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-primary hover:underline">
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