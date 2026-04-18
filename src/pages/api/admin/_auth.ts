import type { NextApiRequest } from "next";
import { createClient } from "@supabase/supabase-js";

export async function verifyAdmin(req: NextApiRequest) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return { authorized: false, user: null };
    }

    const token = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Verify token
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return { authorized: false, user: null };
    }

    // Check if user is super admin
    const { data: userData } = await supabase
      .from("users")
      .select("role_id, roles(name)")
      .eq("id", user.id)
      .single();

    const isSuperAdmin = userData?.roles?.name === "super_admin";

    return {
      authorized: isSuperAdmin,
      user: isSuperAdmin ? user : null
    };
  } catch (error) {
    return { authorized: false, user: null };
  }
}