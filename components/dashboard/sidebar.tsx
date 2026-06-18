"use client";

import {
  LayoutDashboard,
  CheckSquare,
  Calendar,
  BarChart3,
  Users,
  Settings,
  HelpCircle,
  LogOut,
  Bot,
  Sparkles,
  Wand2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, createContext, useContext, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

const SidebarContext = createContext<{
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

type SidebarItem = {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  badge?: string;
};

const menuItems: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
];

const aiItems = [
  { icon: Bot, label: "AI Assistant", badge: "New", href: "/ai-assistant" },
  { icon: Sparkles, label: "Content Generator", href: "/content-generator" },
  { icon: Wand2, label: "Smart Suggestions", href: "/suggestions" },
];

const generalItems = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: HelpCircle, label: "Help", href: "/help" },
  { icon: LogOut, label: "Logout", href: "/logout" },
];

const securityItems: SidebarItem[] = [
  { icon: Shield, label: "Security", href: "/security" },
];

function SidebarInner({
  isCollapsed = false,
  onToggle,
}: { isCollapsed?: boolean; onToggle?: () => void } = {}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get("email");

  const getHref = (basePath: string) => {
    if (emailParam) {
      return `${basePath}?email=${encodeURIComponent(emailParam)}`;
    }
    return basePath;
  };

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-screen overflow-y-auto lg:block transition-all duration-300 ease-in-out z-40",
        "bg-sidebar/95 backdrop-blur-xl border-r border-sidebar-border shadow-[4px_0_24px_rgba(0,0,0,0.04)]",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className={cn("p-4", isCollapsed && "px-2")}>
        <div
          className={cn(
            "mb-6 flex items-center",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {!isCollapsed && (
            <Link href="/">
              <div>
                <span className="text-base font-bold text-sidebar-foreground">
                  AIT ARC
                </span>
              </div>
            </Link>
          )}
          {onToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className={cn(
                "h-7 w-7 rounded-lg hover:bg-sidebar-accent",
                isCollapsed && "mx-auto",
              )}
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5" />
              ) : (
                <ChevronLeft className="w-3.5 h-3.5" />
              )}
            </Button>
          )}
        </div>

        <div className="space-y-4">
          <div className="mb-6">
            {!isCollapsed && (
              <p className="text-[11px] font-bold text-muted-foreground/70 mb-3 uppercase tracking-wider px-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/40"></span>
                Workspace
              </p>
            )}
            <nav className="space-y-1 px-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={getHref(item.href)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group relative overflow-hidden",
                      isActive
                        ? "text-primary font-semibold bg-primary/10 shadow-[inset_3px_0_0_hsl(var(--primary))]"
                        : "text-muted-foreground font-medium hover:bg-sidebar-accent/60 hover:text-foreground",
                      isCollapsed && "justify-center px-0",
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                    )}
                    <item.icon
                      className={cn(
                        "w-[18px] h-[18px] transition-all duration-300 relative z-10",
                        !isActive && "group-hover:scale-110 group-hover:text-primary/70",
                        isActive && "drop-shadow-sm",
                        isCollapsed && "w-5 h-5"
                      )}
                    />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between relative z-10">
                        <span className="truncate transition-transform duration-300 group-hover:translate-x-0.5">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mb-6">
            {!isCollapsed && (
              <p className="text-[11px] font-bold text-muted-foreground/70 mb-3 uppercase tracking-wider px-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-destructive/40"></span>
                Security Centre
              </p>
            )}
            <nav className="space-y-1 px-2">
              {securityItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    href={getHref(item.href)}
                    title={isCollapsed ? item.label : undefined}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group relative overflow-hidden",
                      isActive
                        ? "text-primary font-semibold bg-primary/10 shadow-[inset_3px_0_0_hsl(var(--primary))]"
                        : "text-muted-foreground font-medium hover:bg-sidebar-accent/60 hover:text-foreground",
                      isCollapsed && "justify-center px-0",
                    )}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50" />
                    )}
                    <item.icon
                      className={cn(
                        "w-[18px] h-[18px] transition-all duration-300 relative z-10",
                        !isActive && "group-hover:scale-110 group-hover:text-primary/70",
                        isActive && "drop-shadow-sm",
                        isCollapsed && "w-5 h-5"
                      )}
                    />
                    {!isCollapsed && (
                      <div className="flex-1 flex items-center justify-between relative z-10">
                        <span className="truncate transition-transform duration-300 group-hover:translate-x-0.5">
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}

export function Sidebar({
  isCollapsed = false,
  onToggle,
}: { isCollapsed?: boolean; onToggle?: () => void } = {}) {
  return (
    <Suspense fallback={null}>
      <SidebarInner isCollapsed={isCollapsed} onToggle={onToggle} />
    </Suspense>
  );
}
