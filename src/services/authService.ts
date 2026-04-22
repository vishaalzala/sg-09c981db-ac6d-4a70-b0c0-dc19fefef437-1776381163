import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

export interface AuthUser {
    id: string;
    email: string;
    user_metadata?: any;
    created_at?: string;
}

export interface AuthError {
    message: string;
    code?: string;
}

export interface SignupData {
    email: string;
    password: string;
    fullName: string;
    companyName?: string;
    phone?: string;
}

export interface SignupResult {
    user: User | null;
    company: { id: string; name: string } | null;
    error: Error | null;
    requiresEmailConfirmation?: boolean;
}

const getURL = () => {
    let url =
        process?.env?.NEXT_PUBLIC_SITE_URL ??
        process?.env?.NEXT_PUBLIC_VERCEL_URL ??
        "http://localhost:3000";

    if (!url) {
        url = "http://localhost:3000";
    }

    url = url.startsWith("http") ? url : `https://${url}`;
    url = url.endsWith("/") ? url : `${url}/`;

    return url;
};

const mapAuthUser = (user: User | null): AuthUser | null => {
    if (!user) return null;

    return {
        id: user.id,
        email: user.email || "",
        user_metadata: user.user_metadata,
        created_at: user.created_at,
    };
};

export const authService = {
    async getCurrentUser(): Promise<AuthUser | null> {
        const {
            data: { user },
        } = await supabase.auth.getUser();

        return mapAuthUser(user);
    },

    async getCurrentSession(): Promise<Session | null> {
        const {
            data: { session },
        } = await supabase.auth.getSession();

        return session;
    },

    async getCurrentUserCompanyId(): Promise<string | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data, error } = await supabase
            .from("users")
            .select("company_id")
            .eq("id", user.id)
            .maybeSingle();

        if (error) {
            console.error("Error loading user company:", error);
            throw error;
        }

        return data?.company_id || null;
    },

    async validateCompanyAccess(companyId: string): Promise<boolean> {
        const user = await this.getCurrentUser();
        if (!user) return false;

        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .maybeSingle();

        if (profileError) {
            console.error("Error loading profile role:", profileError);
            return false;
        }

        if (profile?.role === "super_admin") return true;

        const userCompanyId = await this.getCurrentUserCompanyId();
        if (!userCompanyId) return false;

        return userCompanyId === companyId;
    },

    async signUp(
        email: string,
        password: string,
        fullName?: string
    ): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${getURL()}auth/confirm-email`,
                    data: {
                        full_name: fullName || "",
                    },
                },
            });

            if (error) {
                return {
                    user: null,
                    error: {
                        message: error.message,
                        code: error.status?.toString(),
                    },
                };
            }

            return {
                user: mapAuthUser(data.user),
                error: null,
            };
        } catch (error) {
            console.error("Unexpected sign up error:", error);
            return {
                user: null,
                error: {
                    message: "An unexpected error occurred during sign up",
                },
            };
        }
    },

    async signIn(
        email: string,
        password: string
    ): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return {
                    user: null,
                    error: {
                        message: error.message,
                        code: error.status?.toString(),
                    },
                };
            }

            return {
                user: mapAuthUser(data.user),
                error: null,
            };
        } catch (error) {
            console.error("Unexpected sign in error:", error);
            return {
                user: null,
                error: {
                    message: "An unexpected error occurred during sign in",
                },
            };
        }
    },

    async signOut(): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return {
                    error: {
                        message: error.message,
                    },
                };
            }

            return { error: null };
        } catch (error) {
            console.error("Unexpected sign out error:", error);
            return {
                error: {
                    message: "An unexpected error occurred during sign out",
                },
            };
        }
    },

    async resetPassword(email: string): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${getURL()}auth/reset-password`,
            });

            if (error) {
                return {
                    error: {
                        message: error.message,
                    },
                };
            }

            return { error: null };
        } catch (error) {
            console.error("Unexpected reset password error:", error);
            return {
                error: {
                    message: "An unexpected error occurred during password reset",
                },
            };
        }
    },

    async confirmEmail(
        token: string,
        type: "signup" | "recovery" | "email_change" = "signup"
    ): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type,
            });

            if (error) {
                return {
                    user: null,
                    error: {
                        message: error.message,
                        code: error.status?.toString(),
                    },
                };
            }

            return {
                user: mapAuthUser(data.user),
                error: null,
            };
        } catch (error) {
            console.error("Unexpected confirm email error:", error);
            return {
                user: null,
                error: {
                    message: "An unexpected error occurred during email confirmation",
                },
            };
        }
    },

    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback);
    },
};

/**
 * Main signup flow for the app.
 *
 * Important:
 * - This creates the auth user only.
 * - The database trigger creates the `profiles` row.
 * - Company / users / subscription setup should happen after signup
 *   on the onboarding page or server onboarding API.
 */
export async function signUp(data: SignupData): Promise<SignupResult> {
    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                emailRedirectTo: `${getURL()}auth/confirm-email`,
                data: {
                    full_name: data.fullName,
                },
            },
        });

        if (authError) {
            throw authError;
        }

        if (!authData.user) {
            throw new Error("User creation failed");
        }

        const requiresEmailConfirmation =
            !authData.session &&
            !!authData.user &&
            authData.user.identities !== undefined;

        return {
            user: authData.user,
            company: null,
            error: null,
            requiresEmailConfirmation,
        };
    } catch (error: any) {
        console.error("Signup error:", error);

        let message = error?.message || "Signup failed.";

        if (message.toLowerCase().includes("email rate limit exceeded")) {
            message = "Too many signup attempts. Please wait a moment and try again.";
        }

        return {
            user: null,
            company: null,
            error: new Error(message),
            requiresEmailConfirmation: false,
        };
    }
}