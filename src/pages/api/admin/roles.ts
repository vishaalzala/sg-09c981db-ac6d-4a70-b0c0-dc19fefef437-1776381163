import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function checkSuperAdmin(req: NextApiRequest) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return { authorized: false, user: null };

    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseAdmin.auth.getUser(token);
    if (!user) return { authorized: false, user: null };

    const { data: userData } = await supabaseAdmin
      .from("users")
      .select("role_id, roles(name)")
      .eq("id", user.id)
      .single();

    const roles = userData?.roles as any;
    const isSuperAdmin = roles && (Array.isArray(roles) ? roles[0]?.name === "super_admin" : roles.name === "super_admin");

    return {
      authorized: isSuperAdmin,
      user: isSuperAdmin ? user : null
    };
  } catch (error) {
    return { authorized: false, user: null };
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { authorized, user } = await checkSuperAdmin(req);
  if (!authorized) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  try {
    // GET - List all roles
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("roles")
        .select("*")
        .order("name");

      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST - Create new role
    if (req.method === "POST") {
      const { name, display_name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Role name is required" });
      }

      const { data, error } = await supabaseAdmin
        .from("roles")
        .insert({
          name,
          display_name: display_name || name,
          description
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await supabaseAdmin.from("audit_logs").insert({
        user_id: user!.id,
        action_type: "create",
        entity_type: "role",
        entity_id: data.id,
        metadata: { role_name: name, display_name, description }
      });

      return res.status(201).json(data);
    }

    // PUT - Update role
    if (req.method === "PUT") {
      const { id, name, display_name, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Role ID is required" });
      }

      const { data, error } = await supabaseAdmin
        .from("roles")
        .update({
          name,
          display_name,
          description
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await supabaseAdmin.from("audit_logs").insert({
        user_id: user!.id,
        action_type: "update",
        entity_type: "role",
        entity_id: id,
        metadata: { role_name: name, display_name, description }
      });

      return res.status(200).json(data);
    }

    // DELETE - Delete role
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Role ID is required" });
      }

      // Check if role is in use
      const { data: usersWithRole } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("role_id", id)
        .limit(1);

      if (usersWithRole && usersWithRole.length > 0) {
        return res.status(400).json({ 
          error: "Cannot delete role - it is assigned to users" 
        });
      }

      // Delete role permissions first
      await supabaseAdmin
        .from("role_permissions")
        .delete()
        .eq("role_id", id);

      // Delete role
      const { error } = await supabaseAdmin
        .from("roles")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log audit trail
      await supabaseAdmin.from("audit_logs").insert({
        user_id: user!.id,
        action_type: "delete",
        entity_type: "role",
        entity_id: id,
        metadata: { role_id: id }
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error managing roles:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to manage role"
    });
  }
}