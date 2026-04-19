import { ReactNode, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase,
  Calendar,
  FileText,
  Receipt,
  ShieldCheck,
  Users,
  Car,
  Layers,
  Package,
  Warehouse,
  ShoppingCart,
  UserCircle,
  Clock,
  Bell,
  BarChart3,
  Settings,
  HelpCircle,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
  companyId?: any;
  companyName?: string;
  userName?: string;
}

const navigationGroups = [
  {
    items: [
      { name: "Dashboard", href: "/dashboard/job-centre", icon: LayoutDashboard },
      { name: "Job Board", href: "/dashboard/job-centre", icon: Briefcase }
    ]
  },
  {
    title: "Operations",
    items: [
      { name: "Bookings", href: "/dashboard/bookings", icon: Calendar },
      { name: "Jobs", href: "/dashboard/jobs", icon: FileText },
      { name: "Quotes", href: "/dashboard/quotes", icon: Receipt },
      { name: "Invoices", href: "/dashboard/invoices", icon: Receipt },
      { name: "WOF", href: "/dashboard/wof", icon: ShieldCheck }
    ]
  },
  {
    title: "CRM",
    items: [
      { name: "Customers", href: "/dashboard/customers", icon: Users },
      { name: "Vehicles", href: "/dashboard/vehicles", icon: Car },
      { name: "Job Types", href: "/dashboard/job-types", icon: Layers }
    ]
  },
  {
    title: "Parts & Suppliers",
    items: [
      { name: "Suppliers", href: "/dashboard/suppliers", icon: Warehouse },
      { name: "Inventory", href: "/dashboard/inventory", icon: Package },
      { name: "Purchase Orders", href: "/dashboard/purchase-orders", icon: ShoppingCart }
    ]
  },
  {
    title: "Staff",
    items: [
      { name: "Staff", href: "/dashboard/staff", icon: UserCircle },
      { name: "Time Sheet", href: "/dashboard/timesheets", icon: Clock }
    ]
  },
  {
    title: "Office",
    items: [
      { name: "Reminders", href: "/dashboard/reminders", icon: Bell },
      { name: "Reports", href: "/dashboard/reports", icon: BarChart3 },
      { name: "Settings", href: "/dashboard/settings", icon: Settings },
      { name: "Help", href: "/dashboard/help", icon: HelpCircle }
    ]
  }
];

export function AppLayout({ children, companyId }: AppLayoutProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isActive = (href: string) => {
    return router.pathname === href || router.pathname.startsWith(href + "/");
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 bg-card border-r",
          sidebarOpen ? "w-64" : "w-16"
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {sidebarOpen && (
            <Link href="/dashboard/job-centre" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded bg-primary" />
              <span className="font-heading font-bold text-lg">Workshop</span>
            </Link>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-muted rounded-md"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navigationGroups.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-2">
              {group.title && sidebarOpen && (
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      {sidebarOpen && <span>{item.name}</span>}
                      {sidebarOpen && active && <ChevronRight className="ml-auto h-4 w-4" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarOpen ? "ml-64" : "ml-16"
        )}
      >
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex flex-1 items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-lg font-semibold">
                {router.pathname.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">
                Company ID: {companyId?.slice(0, 8)}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}