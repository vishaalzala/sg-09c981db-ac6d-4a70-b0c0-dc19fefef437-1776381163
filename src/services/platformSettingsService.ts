import { supabase } from "@/integrations/supabase/client";
import type { Json, Tables } from "@/integrations/supabase/database.types";
type PlatformSetting=Tables<"platform_settings">;
export async function getPlatformSettings(keys?:string[]){let query=supabase.from("platform_settings").select("*").order("setting_key"); if(keys?.length) query=query.in("setting_key",keys); const {data,error}=await query; if(error) throw error; return data||[];}
export async function getPlatformSettingsMap(keys?:string[]){const settings=await getPlatformSettings(keys); return settings.reduce<Record<string,PlatformSetting>>((acc,s)=>{acc[s.setting_key]=s; return acc;},{});}
export async function upsertPlatformSetting(setting_key:string, setting_value:Json, description?:string){const {data:{user}}=await supabase.auth.getUser(); const {data,error}=await supabase.from("platform_settings").upsert({setting_key,setting_value,description:description??null,updated_by:user?.id??null,updated_at:new Date().toISOString()},{onConflict:"setting_key"}).select().single(); if(error) throw error; return data;}
