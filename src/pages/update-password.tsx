import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Wrench, ArrowLeft, Eye, EyeOff } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function UpdatePasswordPage() {
    const router = useRouter();
    const { toast } = useToast();

    const [checkingSession, setCheckingSession] = useState(true);
    const [hasRecoverySession, setHasRecoverySession] = useState(false);
    const [saving, setSaving] = useState(false);

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const passwordMismatch = useMemo(() => {
        return confirmPassword.length > 0 && newPassword !== confirmPassword;
    }, [newPassword, confirmPassword]);

    useEffect(() => {
        let mounted = true;

        const checkRecoverySession = async () => {
            try {
                const hash = typeof window !== "undefined" ? window.location.hash : "";
                const query = typeof window !== "undefined" ? window.location.search : "";

                if (query.includes("error") || hash.includes("error")) {
                    const params = new URLSearchParams(query || hash.replace("#", "?"));
                    const errorDescription =
                        params.get("error_description") ||
                        params.get("error") ||
                        "Password reset link is invalid or expired.";

                    throw new Error(decodeURIComponent(errorDescription));
                }

                const { data, error } = await supabase.auth.getSession();

                if (error) {
                    throw error;
                }

                if (!mounted) return;

                if (data.session) {
                    setHasRecoverySession(true);
                    return;
                }

                setHasRecoverySession(false);
            } catch (error: any) {
                if (!mounted) return;

                setHasRecoverySession(false);
                toast({
                    title: "Invalid reset link",
                    description: error?.message || "Please request a new password reset link.",
                    variant: "destructive",
                });
            } finally {
                if (mounted) {
                    setCheckingSession(false);
                }
            }
        };

        checkRecoverySession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
            if (!mounted) return;

            if (event === "PASSWORD_RECOVERY" || session) {
                setHasRecoverySession(true);
                setCheckingSession(false);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [toast]);

    const handleUpdatePassword = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!newPassword || !confirmPassword) {
            toast({
                title: "Missing password",
                description: "Please enter and confirm your new password.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword.length < 8) {
            toast({
                title: "Password too short",
                description: "Your new password must be at least 8 characters.",
                variant: "destructive",
            });
            return;
        }

        if (newPassword !== confirmPassword) {
            toast({
                title: "Passwords do not match",
                description: "Please make sure both password fields match.",
                variant: "destructive",
            });
            return;
        }

        setSaving(true);

        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (error) {
                throw error;
            }

            await supabase.auth.signOut();

            toast({
                title: "Password updated",
                description: "Your password has been updated. Please log in again.",
            });

            router.replace("/login?passwordUpdated=true");
        } catch (error: any) {
            toast({
                title: "Could not update password",
                description: error?.message || "Please try again.",
                variant: "destructive",
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-6">
            <Link
                href="/login"
                className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition"
            >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Login</span>
            </Link>

            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <Wrench className="h-10 w-10 text-primary" />
                        <span className="text-3xl font-heading font-bold">WorkshopPro</span>
                    </div>
                    <h1 className="text-2xl font-heading font-bold">Update Password</h1>
                    <p className="text-muted-foreground">
                        Create a new password for your account
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Set New Password</CardTitle>
                        <CardDescription>
                            Enter a secure password with at least 8 characters.
                        </CardDescription>
                    </CardHeader>

                    {checkingSession ? (
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                Checking your reset link...
                            </p>
                        </CardContent>
                    ) : !hasRecoverySession ? (
                        <>
                            <CardContent className="space-y-3">
                                <p className="text-sm text-destructive">
                                    This password reset link is invalid, expired, or has already been used.
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Please request a new password reset email.
                                </p>
                            </CardContent>
                            <CardFooter>
                                <Button asChild className="w-full">
                                    <Link href="/forgot-password">Request New Reset Link</Link>
                                </Button>
                            </CardFooter>
                        </>
                    ) : (
                        <form onSubmit={handleUpdatePassword}>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">New Password</Label>
                                    <div className="relative">
                                        <Input
                                            id="newPassword"
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={saving}
                                            autoComplete="new-password"
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((current) => !current)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                                    <Input
                                        id="confirmPassword"
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        disabled={saving}
                                        autoComplete="new-password"
                                        placeholder="Confirm new password"
                                    />
                                    {passwordMismatch && (
                                        <p className="text-sm text-destructive">
                                            Passwords do not match.
                                        </p>
                                    )}
                                </div>
                            </CardContent>

                            <CardFooter>
                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={saving || passwordMismatch}
                                >
                                    {saving ? "Updating..." : "Update Password"}
                                </Button>
                            </CardFooter>
                        </form>
                    )}
                </Card>
            </div>
        </div>
    );
}