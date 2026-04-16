import { ReactNode, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { 
  Building2, 
  CreditCard, 
  Activity, 
  Shield, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface AdminLayoutProps {
  children: ReactNode;
  userName?: string;
}

export function AdminLayout({ children, userName = "Super Admin" }: AdminLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigationSections = [
    { label: "Platform Overview", icon: Activity, href: "/admin" },
    { label: "Companies", icon: Building2, href: "/admin/companies" },
    { label: "Plans & Billing", icon: CreditCard, href: "/admin/plans" },
    { label: "Platform Settings", icon: Settings, href: "/admin/settings" },
    { label: "Audit Logs", icon: Shield, href: "/admin/audit" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const isActive = (href: string) => router.pathname === href;

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-slate-900 text-white">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden text-white" onClick={() => setSidebarOpen(!sidebarOpen)}>
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-400" />
              <span className="font-heading font-bold text-lg hidden md:inline">Softgen Super Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 text-white hover:text-white hover:bg-slate-800">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <span className="hidden md:inline">{userName}</span>
                  <ChevronDown className="h-4 w-4 hidden md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>System Administrator</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r bg-slate-900 text-slate-300 pt-16 transition-transform duration-200 ease-in-out md:static md:translate-x-0 md:pt-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="h-full overflow-y-auto p-4 space-y-2">
            <div className="mb-4 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Admin Controls
            </div>
            {navigationSections.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive(item.href)
                    ? "bg-blue-600 text-white"
                    : "hover:bg-slate-800 hover:text-white"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
              </Link>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto bg-background">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}