import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Wrench, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    fullName: "",
    phone: "",
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.companyName || !formData.fullName) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (formData.password.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError || !authData.user) {
        toast({ title: "Signup Failed", description: authError?.message || "Failed to create account", variant: "destructive" });
        setLoading(false);
        return;
      }

      const userId = authData.user.id;

      // Step 2: Create company
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: formData.companyName,
          email: formData.email,
          phone: formData.phone,
          is_active: true,
        })
        .select()
        .single();

      if (companyError || !company) {
        toast({ title: "Error", description: "Failed to create company", variant: "destructive" });
        setLoading(false);
        return;
      }

      // Step 3: Create profile with owner role
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          role: "owner",
          full_name: formData.fullName,
        });

      if (profileError) {
        console.error("Profile creation error:", profileError);
      }

      // Step 4: Link user to company
      const { error: userError } = await supabase
        .from("users")
        .insert({
          id: userId,
          company_id: company.id,
          email: formData.email,
          full_name: formData.fullName,
        });

      if (userError) {
        console.error("User linkage error:", userError);
      }

      // Step 5: Enable all add-ons for demo/trial
      const { data: addons } = await supabase
        .from("addon_catalog")
        .select("id");

      if (addons) {
        const addonInserts = addons.map(addon => ({
          company_id: company.id,
          addon_id: addon.id,
          is_enabled: true,
          enabled_at: new Date().toISOString(),
        }));

        await supabase.from("company_addons").insert(addonInserts);
      }

      // Step 6: Create default payment methods
      const defaultPaymentMethods = [
        { name: "Cash", type: "cash", is_active: true },
        { name: "EFTPOS", type: "eftpos", is_active: true, fee_type: "percentage", fee_value: 1.5 },
        { name: "Credit Card", type: "credit_card", is_active: true, fee_type: "percentage", fee_value: 2.5 },
        { name: "Bank Transfer", type: "bank_transfer", is_active: true },
      ];

      await supabase.from("payment_methods").insert(
        defaultPaymentMethods.map(pm => ({ ...pm, company_id: company.id }))
      );

      toast({ 
        title: "Success!", 
        description: "Your workshop account has been created. Welcome to WorkshopPro!" 
      });

      // Auto-login and redirect
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.error("Signup error:", error);
      toast({ title: "Signup Failed", description: error.message || "An error occurred", variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-6">
      <Link href="/" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Home</span>
      </Link>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Wrench className="h-10 w-10 text-primary" />
            <span className="text-3xl font-heading font-bold">WorkshopPro</span>
          </div>
          <h1 className="text-2xl font-heading font-bold">Create Your Workshop Account</h1>
          <p className="text-muted-foreground">Start managing your workshop in minutes</p>
        </div>

        <Card>
          <form onSubmit={handleSignup}>
            <CardHeader>
              <CardTitle>Sign Up</CardTitle>
              <CardDescription>Enter your details to create your workshop account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Workshop Name <span className="text-destructive">*</span></Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="e.g., AutoTech Workshop"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Your Full Name <span className="text-destructive">*</span></Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Smith"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  disabled={loading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address <span className="text-destructive">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@workshop.co.nz"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={loading}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+64 21 123 4567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-destructive">*</span></Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password <span className="text-destructive">*</span></Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  disabled={loading}
                  autoComplete="new-password"
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating Account..." : "Create Workshop Account"}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-xs text-center text-muted-foreground mt-6">
          By signing up, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
}