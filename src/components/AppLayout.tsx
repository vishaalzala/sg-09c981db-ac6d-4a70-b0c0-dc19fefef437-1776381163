import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Calendar, 
  Wrench, 
  FileText, 
  Receipt,
  Package,
  Truck,
  Settings,
  Menu,
  X,
  Bell,
  User,
  LogOut,
  ShieldCheck,
  Gift,
  Globe,
  TrendingUp,
  MessageSquare,
  BarChart3,
  Clock,
  CreditCard,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";

interface AppLayoutProps {
  children: ReactNode;
  companyId?: string | null;
  userRole?: string;
  companyName?: string;
  userName?: string;
}

export function AppLayout({ children, companyId, userRole = "service_advisor", companyName = "Workshop", userName = "User" }: AppLayoutProps) {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isActive = (href: string) => {
    if (href === "/dashboard/job-centre" && router.pathname === "/job-centre") return true;
    return router.pathname === href || router.pathname.startsWith(href + "/");
  };

  const navItems = [
    { label: "Diary", href: "/dashboard", icon: Calendar },
    { label: "Job Centre", href: "/dashboard/job-centre", icon: Wrench },
    { label: "Customers & Vehicles", href: "/dashboard/customers", icon: Users },
    { label: "Invoices & Bills", href: "/dashboard/invoices", icon: Receipt },
    { label: "Inventory & Suppliers", href: "/dashboard/inventory", icon: Package },
    { label: "Service Schedules", href: "/dashboard/service-schedules", icon: Clock },
    { label: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { label: "Timesheets", href: "/dashboard/timesheets", icon: Clock },
    { label: "POS", href: "/dashboard/pos", icon: CreditCard },
    { label: "Settings", href: "/dashboard/settings", icon: Settings },
    { label: "Help", href: "/dashboard/help", icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-[#2c3e50] text-white">
        <div className="flex h-12 items-center px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/dashboard/job-centre" className="flex items-center gap-2 mr-4">
            <div className="h-8 w-8 rounded bg-white flex items-center justify-center">
              <Wrench className="h-5 w-5 text-[#2c3e50]" />
            </div>
            <span className="font-semibold text-sm hidden sm:inline">{companyName}</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-xs font-medium rounded transition-colors flex items-center gap-2",
                  isActive(item.href)
                    ? "bg-white/20 text-white"
                    : "text-white/80 hover:bg-white/10 hover:text-white"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 ml-auto">
            <div className="hidden lg:block w-64">
              <GlobalSearchBar companyId={companyId} />
            </div>

            <Button variant="ghost" size="icon" className="relative text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-orange-500 rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{userRole}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <nav className="flex flex-col p-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded transition-colors flex items-center gap-2",
                    isActive(item.href)
                      ? "bg-white/20 text-white"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}