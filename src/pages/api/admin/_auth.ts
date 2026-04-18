import { createClient } from "@supabase/supabase-js";
import type { NextApiRequest } from "next";

export async function verifyAdminAuth(req: NextApiRequest) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader?.startsWith("Bearer ")) {
      return { authorized: false, user: null };
    }

    const token = authHeader.substring(7);
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing Supabase environment variables");
      return { authorized: false, user: null };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify JWT token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      console.error("Auth verification failed:", userError);
      return { authorized: false, user: null };
    }

    // Fetch role from profiles table ONLY (source of truth for authorization)
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Profile fetch failed:", profileError);
      return { authorized: false, user: null };
    }

    // Authorize only super_admin role
    const isSuperAdmin = profile.role === "super_admin";

    if (!isSuperAdmin) {
      console.error("User is not super admin:", profile.role);
      return { authorized: false, user: null };
    }

    return { authorized: true, user };

  } catch (error) {
    console.error("Admin auth error:", error);
    return { authorized: false, user: null };
  }
}