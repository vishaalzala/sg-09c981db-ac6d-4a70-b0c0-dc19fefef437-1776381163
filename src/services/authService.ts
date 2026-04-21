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

// Add new interface for signup
export interface SignupData {
    email: string;
    password: string;
    fullName: string;
    companyName: string;
    phone?: string;
}

export interface SignupResult {
    user: User | null;
    company: { id: string; name: string } | null;
    error: Error | null;
    onboardingRequired: boolean;
    emailConfirmationRequired: boolean;
}

// Dynamic URL Helper
const getURL = () => {
    let url = process?.env?.NEXT_PUBLIC_VERCEL_URL ??
        process?.env?.NEXT_PUBLIC_SITE_URL ??
        'http://localhost:3000'

    // Handle undefined or null url
    if (!url) {
        url = 'http://localhost:3000';
    }

    // Ensure url has protocol
    url = url.startsWith('http') ? url : `https://${url}`

    // Ensure url ends with slash
    url = url.endsWith('/') ? url : `${url}/`

    return url
}

export const authService = {
    // Get current user
    async getCurrentUser(): Promise<AuthUser | null> {
        const { data: { user } } = await supabase.auth.getUser();
        return user ? {
            id: user.id,
            email: user.email || "",
            user_metadata: user.user_metadata,
            created_at: user.created_at
        } : null;
    },

    // Get current session
    async getCurrentSession(): Promise<Session | null> {
        const { data: { session } } = await supabase.auth.getSession();
        return session;
    },

    // Get current user's company_id
    async getCurrentUserCompanyId(): Promise<string | null> {
        const user = await this.getCurrentUser();
        if (!user) return null;

        const { data } = await supabase
            .from("users")
            .select("company_id")
            .eq("id", user.id)
            .single();

        return data?.company_id || null;
    },

    // Validate user belongs to company
    async validateCompanyAccess(companyId: string): Promise<boolean> {
        const userCompanyId = await this.getCurrentUserCompanyId();
        if (!userCompanyId) return false;

        // Check if super admin
        const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", (await this.getCurrentUser())?.id || "")
            .single();

        if (profile?.role === "super_admin") return true;

        return userCompanyId === companyId;
    },

    // Sign up with email and password
    async signUp(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${getURL()}auth/confirm-email`
                }
            });

            if (error) {
                return { user: null, error: { message: error.message, code: error.status?.toString() } };
            }

            const authUser = data.user ? {
                id: data.user.id,
                email: data.user.email || "",
                user_metadata: data.user.user_metadata,
                created_at: data.user.created_at
            } : null;

            return { user: authUser, error: null };
        } catch (error) {
            return {
                user: null,
                error: { message: "An unexpected error occurred during sign up" }
            };
        }
    },

    // Sign in with email and password
    async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                return { user: null, error: { message: error.message, code: error.status?.toString() } };
            }

            const authUser = data.user ? {
                id: data.user.id,
                email: data.user.email || "",
                user_metadata: data.user.user_metadata,
                created_at: data.user.created_at
            } : null;

            return { user: authUser, error: null };
        } catch (error) {
            return {
                user: null,
                error: { message: "An unexpected error occurred during sign in" }
            };
        }
    },

    // Sign out
    async signOut(): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.signOut();

            if (error) {
                return { error: { message: error.message } };
            }

            return { error: null };
        } catch (error) {
            return {
                error: { message: "An unexpected error occurred during sign out" }
            };
        }
    },

    // Reset password
    async resetPassword(email: string): Promise<{ error: AuthError | null }> {
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${getURL()}auth/reset-password`,
            });

            if (error) {
                return { error: { message: error.message } };
            }

            return { error: null };
        } catch (error) {
            return {
                error: { message: "An unexpected error occurred during password reset" }
            };
        }
    },

    // Confirm email (REQUIRED)
    async confirmEmail(token: string, type: 'signup' | 'recovery' | 'email_change' = 'signup'): Promise<{ user: AuthUser | null; error: AuthError | null }> {
        try {
            const { data, error } = await supabase.auth.verifyOtp({
                token_hash: token,
                type: type
            });

            if (error) {
                return { user: null, error: { message: error.message, code: error.status?.toString() } };
            }

            const authUser = data.user ? {
                id: data.user.id,
                email: data.user.email || "",
                user_metadata: data.user.user_metadata,
                created_at: data.user.created_at
            } : null;

            return { user: authUser, error: null };
        } catch (error) {
            return {
                user: null,
                error: { message: "An unexpected error occurred during email confirmation" }
            };
        }
    },

    // Listen to auth state changes
    onAuthStateChange(callback: (event: string, session: Session | null) => void) {
        return supabase.auth.onAuthStateChange(callback);
    }
};

/**
 * Sign up new user with company and trial subscription
 */
export async function signUp(data: SignupData): Promise<SignupResult> {
    try {
        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    full_name: data.fullName,
                    signup_intent: "company_owner"
                }
            }
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("User creation failed");

        // If email confirmation is enabled, the user may not have a session yet.
        // In that case we defer company creation until after the first verified login.
        if (!authData.session) {
            return {
                user: authData.user,
                company: null,
                error: null,
                onboardingRequired: true,
                emailConfirmationRequired: true
            };
        }

        const company = await completeCompanyOnboarding({
            companyName: data.companyName,
            phone: data.phone,
            email: data.email,
            fullName: data.fullName,
            userId: authData.user.id
        });

        return {
            user: authData.user,
            company,
            error: null,
            onboardingRequired: false,
            emailConfirmationRequired: false
        };

    } catch (error) {
        console.error("Signup error:", error);
        return {
            user: null,
            company: null,
            error: error as Error,
            onboardingRequired: false,
            emailConfirmationRequired: false
        };
    }
}

interface CompleteCompanyOnboardingInput {
    companyName: string;
    phone?: string;
    email?: string;
    fullName?: string;
    userId?: string;
}

export async function completeCompanyOnboarding(input: CompleteCompanyOnboardingInput): Promise<{ id: string; name: string }> {
    const { data: authUserData, error: authUserError } = await supabase.auth.getUser();
    if (authUserError) throw authUserError;

    const currentUser = authUserData.user;
    const userId = input.userId || currentUser?.id;
    const userEmail = input.email || currentUser?.email || "";
    const userFullName = input.fullName || currentUser?.user_metadata?.full_name || userEmail;

    if (!userId) {
        throw new Error("You must be signed in to complete company setup.");
    }

    const { data: existingUser } = await supabase
        .from("users")
        .select("company_id, companies(id, name)")
        .eq("id", userId)
        .maybeSingle() as any;

    if (existingUser?.company_id && existingUser?.companies?.id) {
        return {
            id: existingUser.companies.id,
            name: existingUser.companies.name
        };
    }

    // Ensure profile role stays aligned with the owner signup flow.
    await supabase
        .from("profiles")
        .update({
            role: "company_owner",
            full_name: userFullName
        })
        .eq("id", userId);

    const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
            name: input.companyName,
            email: userEmail,
            phone: input.phone,
            is_active: true
        })
        .select("id, name")
        .single();

    if (companyError) throw companyError;

    const { data: ownerRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", "company_owner")
        .single();

    const { error: usersError } = await supabase
        .from("users")
        .upsert({
            id: userId,
            company_id: company.id,
            email: userEmail,
            full_name: userFullName,
            role_id: ownerRole?.id ?? null
        });

    if (usersError) throw usersError;

    const { data: trialPlan } = await supabase
        .from("subscription_plans")
        .select("id")
        .eq("name", "free_trial")
        .maybeSingle();

    if (trialPlan?.id) {
        const trialStart = new Date();
        const trialEnd = new Date();
        trialEnd.setDate(trialEnd.getDate() + 14);

        const { error: subscriptionError } = await supabase
            .from("company_subscriptions")
            .upsert({
                company_id: company.id,
                plan_id: trialPlan.id,
                status: "trial_active",
                trial_ends_at: trialEnd.toISOString(),
                current_period_start: trialStart.toISOString(),
                current_period_end: trialEnd.toISOString()
            }, {
                onConflict: "company_id"
            });

        if (subscriptionError) {
            console.warn("Trial subscription setup warning:", subscriptionError);
        }
    }

    return {
        id: company.id,
        name: company.name
    };
}
