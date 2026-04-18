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
    // GET - List all permissions
    if (req.method === "GET") {
      const { data, error } = await supabaseAdmin
        .from("permissions")
        .select("*")
        .order("category, name");

      if (error) throw error;
      return res.status(200).json(data);
    }

    // POST - Create new permission
    if (req.method === "POST") {
      const { name, category, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: "Permission name is required" });
      }

      const { data, error } = await supabaseAdmin
        .from("permissions")
        .insert({
          name,
          category: category || "Other",
          description
        })
        .select()
        .single();

      if (error) throw error;

      // Log audit trail
      await supabaseAdmin.from("audit_logs").insert({
        user_id: user!.id,
        action_type: "create",
        entity_type: "permission",
        entity_id: data.id,
        metadata: { permission_name: name, category, description }
      });

      return res.status(201).json(data);
    }

    // PUT - Update permission
    if (req.method === "PUT") {
      const { id, name, category, description } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Permission ID is required" });
      }

      const { data, error } = await supabaseAdmin
        .from("permissions")
        .update({
          name,
          category,
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
        entity_type: "permission",
        entity_id: id,
        metadata: { permission_name: name, category, description }
      });

      return res.status(200).json(data);
    }

    // DELETE - Delete permission
    if (req.method === "DELETE") {
      const { id } = req.body;

      if (!id) {
        return res.status(400).json({ error: "Permission ID is required" });
      }

      // Delete role permissions first
      await supabaseAdmin
        .from("role_permissions")
        .delete()
        .eq("permission_id", id);

      // Delete permission
      const { error } = await supabaseAdmin
        .from("permissions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Log audit trail
      await supabaseAdmin.from("audit_logs").insert({
        user_id: user!.id,
        action_type: "delete",
        entity_type: "permission",
        entity_id: id,
        metadata: { permission_id: id }
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Error managing permissions:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to manage permission"
    });
  }
}