import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Building2, 
  Users, 
  CreditCard, 
  Package, 
  Shield,
  Settings,
  FileText,
  BarChart3,
  LogOut,
  Menu
} from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkSuperAdmin();
  }, []);

  const checkSuperAdmin = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "super_admin") {
        router.push("/dashboard");
        return;
      }

      setIsSuperAdmin(true);
    } catch (error) {
      console.error("Error checking super admin:", error);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!isSuperAdmin) {
    return null;
  }

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Companies", href: "/admin/companies", icon: Building2 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Plans & Billing", href: "/admin/plans", icon: CreditCard },
    { name: "Add-ons", href: "/admin/addons", icon: Package },
    { name: "Roles & Permissions", href: "/admin/roles", icon: Shield },
    { name: "Audit Logs", href: "/admin/audit", icon: FileText },
    { name: "Reports", href: "/admin/reports", icon: BarChart3 },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="lg:hidden border-b bg-card px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Admin Panel</span>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Admin</span>
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <Link key={item.name} href={item.href}>
                    <Button
                      variant={router.pathname === item.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 border-r bg-card">
          <div className="flex items-center h-16 px-6 border-b">
            <Shield className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg">Admin Panel</span>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            <nav className="flex-1 px-3 py-4 space-y-1">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={router.pathname === item.href ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Button>
                </Link>
              ))}
            </nav>
            <div className="p-3 border-t">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={handleSignOut}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}