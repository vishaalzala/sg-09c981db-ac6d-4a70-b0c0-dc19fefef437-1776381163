import { LayoutDashboard, Building2, CreditCard, Package, MessageSquare, UserRoundCheck, FileText, Settings, Shield, Activity, LifeBuoy, KeyRound, ScrollText, type LucideIcon } from "lucide-react";
export type AdminNavItem={name:string;href:string;icon:LucideIcon;description?:string};
export const adminNavigation:AdminNavItem[]=[
{name:"Dashboard",href:"/admin/dashboard",icon:LayoutDashboard,description:"SaaS control overview"},
{name:"Companies",href:"/admin/companies",icon:Building2,description:"Tenant lifecycle and onboarding"},
{name:"Billing",href:"/admin/billing",icon:CreditCard,description:"Plans, payments, revenue"},
{name:"Plans",href:"/admin/plans",icon:CreditCard,description:"Subscription catalog"},
{name:"Add-ons",href:"/admin/addons",icon:Package,description:"Feature catalog and activation"},
{name:"Communications",href:"/admin/communications",icon:MessageSquare,description:"Templates and delivery logs"},
{name:"Leads",href:"/admin/leads",icon:UserRoundCheck,description:"Website enquiries and trial conversion"},
{name:"Audit",href:"/admin/audit",icon:FileText,description:"Admin and system actions"},
{name:"System Health",href:"/admin/system-health",icon:Activity,description:"Stripe, SMTP, queue, database"},
{name:"Security",href:"/admin/security",icon:Shield,description:"Sessions, lockouts, policies"},
{name:"Settings",href:"/admin/settings",icon:Settings,description:"Platform, Stripe, SMTP, Twilio"},
{name:"Support",href:"/admin/support",icon:LifeBuoy,description:"Leads, issues, follow-up"},
{name:"Changelog",href:"/admin/changelog",icon:ScrollText,description:"Product updates"},
{name:"API Keys",href:"/admin/api-keys",icon:KeyRound,description:"Future tenant integrations"},
];
export function getAdminNavItem(pathname?:string|null){return adminNavigation.find((item)=>pathname?.startsWith(item.href));}
