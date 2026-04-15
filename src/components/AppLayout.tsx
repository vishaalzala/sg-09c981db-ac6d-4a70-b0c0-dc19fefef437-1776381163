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
  ChevronDown,
  Menu,
  X,
  Search,
  Bell,
  User,
  Building2,
  ShieldCheck,
  Gift,
  Globe,
  TrendingUp,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlobalSearchBar } from "./GlobalSearchBar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface AppLayoutProps {
  children: ReactNode;
  companyId: string;
  userRole?: string;
  companyName?: string;
  userName?: string;
}

interface NavItem {
  label: string;
  icon: any;
  href: string;
  badge?: string;
  children?: { label: string; href: string }[];
}

export function AppLayout({ children, companyId, userRole = "service_advisor", companyName = "Workshop", userName = "User" }: AppLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(["operations"]);

  const navigationSections: Record<string, NavItem[]> = {
    main: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
    ],
    crm: [
      { label: "Customers", icon: Users, href: "/customers" },
      { label: "Vehicles", icon: Car, href: "/vehicles" },
    ],
    operations: [
      { label: "Bookings", icon: Calendar, href: "/bookings", badge: "3" },
      { label: "Jobs", icon: Wrench, href: "/jobs", badge: "12" },
      { label: "Quotes", icon: FileText, href: "/quotes" },
      { label: "Invoices", icon: Receipt, href: "/invoices", badge: "2" },
    ],
    inventory: [
      { label: "Inventory", icon: Package, href: "/inventory" },
      { label: "Suppliers", icon: Truck, href: "/suppliers" },
    ],
    addons: [
      { label: "WOF Compliance", icon: ShieldCheck, href: "/wof" },
      { label: "Loyalty", icon: Gift, href: "/loyalty" },
      { label: "Marketing", icon: TrendingUp, href: "/marketing" },
      { label: "Websites", icon: Globe, href: "/websites" },
    ],
    system: [
      { label: "Settings", icon: Settings, href: "/settings" },
    ],
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  const isActive = (href: string) => router.pathname === href || router.pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="flex h-16 items-center gap-4 px-4">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
              <Wrench className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg hidden md:inline">{companyName}</span>
          </Link>

          <div className="flex-1 max-w-md ml-4">
            <GlobalSearchBar companyId={companyId} />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full"></span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden md:inline">{userName}</span>
                  <ChevronDown className="h-4 w-4 hidden md:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{userName}</span>
                    <span className="text-xs text-muted-foreground font-normal">{userRole}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
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
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-30 w-64 transform border-r bg-background pt-16 transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <nav className="h-full overflow-y-auto p-4 space-y-6">
            {Object.entries(navigationSections).map(([sectionKey, items]) => (
              <div key={sectionKey}>
                <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {sectionKey}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground hover:bg-muted"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <Badge variant="secondary" className="ml-auto">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}