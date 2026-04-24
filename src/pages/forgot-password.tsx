import { useState } from "react";
import Link from "next/link";
import { Wrench, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast({ title: "Error", description: "Please enter your email", variant: "destructive" });
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/update-password` });
      if (error) throw error;
      setSent(true);
      toast({ title: "Email Sent", description: "Check your inbox for password reset instructions" });
    } catch (error: any) { toast({ title: "Error", description: error.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  return <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-6"><Link href="/login" className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition"><ArrowLeft className="h-4 w-4" /><span>Back to Login</span></Link><div className="w-full max-w-md"><div className="text-center mb-8"><div className="flex items-center justify-center gap-2 mb-4"><Wrench className="h-10 w-10 text-primary" /><span className="text-3xl font-heading font-bold">WorkshopPro</span></div><h1 className="text-2xl font-heading font-bold">Reset Password</h1><p className="text-muted-foreground">Enter your email to receive reset instructions</p></div><Card>{!sent ? <form onSubmit={handleReset}><CardHeader><CardTitle>Forgot Password</CardTitle><CardDescription>We'll send you a link to reset your password</CardDescription></CardHeader><CardContent className="space-y-4"><div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@workshop.co.nz" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} /></div></CardContent><CardFooter><Button type="submit" className="w-full" disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button></CardFooter></form> : <><CardHeader><CardTitle>Check Your Email</CardTitle><CardDescription>We've sent password reset instructions to <strong>{email}</strong></CardDescription></CardHeader><CardContent><p className="text-sm text-muted-foreground">Didn't receive the email? Check your spam folder or try again.</p></CardContent><CardFooter><Button variant="outline" className="w-full" onClick={() => setSent(false)}>Try Another Email</Button></CardFooter></>}</Card></div></div>;
}
