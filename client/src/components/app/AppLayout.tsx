// ============================================================================
// PayrollHub — App Layout
// Sidebar navigation + top bar + content area
// ============================================================================

import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { UserRole } from "@shared/types";
import { ROLE_HIERARCHY } from "@shared/const";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CalendarDays,
  FileText,
  BarChart3,
  Settings,
  UserCog,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  Building2,
  Bell,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  minRole?: UserRole;
  badge?: number;
  disabled?: boolean;
  disabledLabel?: string;
}

const navItems: NavItem[] = [
  {
    label: "Tableau de Bord",
    href: "/app",
    icon: <LayoutDashboard size={20} />,
  },
  {
    label: "Employés",
    href: "/app/employes",
    icon: <Users size={20} />,
  },
  {
    label: "Paie",
    href: "/app/paie",
    icon: <Wallet size={20} />,
    disabled: true,
    disabledLabel: "Phase 2",
  },
  {
    label: "Congés",
    href: "/app/conges",
    icon: <CalendarDays size={20} />,
    disabled: true,
    disabledLabel: "Phase 3",
  },
  {
    label: "Documents",
    href: "/app/documents",
    icon: <FileText size={20} />,
    disabled: true,
    disabledLabel: "Phase 4",
  },
  {
    label: "Rapports",
    href: "/app/rapports",
    icon: <BarChart3 size={20} />,
    disabled: true,
    disabledLabel: "Phase 4",
  },
];

const adminItems: NavItem[] = [
  {
    label: "Paramètres",
    href: "/app/parametres",
    icon: <Settings size={20} />,
    minRole: UserRole.ADMIN_RH,
  },
  {
    label: "Utilisateurs",
    href: "/app/utilisateurs",
    icon: <UserCog size={20} />,
    minRole: UserRole.SUPER_ADMIN,
  },
];

function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.SUPER_ADMIN]: "Super Administrateur",
    [UserRole.ADMIN_RH]: "Admin RH",
    [UserRole.ADMIN_PAIE]: "Admin Paie",
    [UserRole.COMPTABLE]: "Comptable",
    [UserRole.MANAGER]: "Manager",
    [UserRole.EMPLOYE]: "Employé",
  };
  return labels[role] || role;
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const userLevel = ROLE_HIERARCHY[user?.role as keyof typeof ROLE_HIERARCHY] || 0;

  const isVisible = (item: NavItem) => {
    if (!item.minRole) return true;
    const requiredLevel = ROLE_HIERARCHY[item.minRole as keyof typeof ROLE_HIERARCHY] || 0;
    return userLevel >= requiredLevel;
  };

  const isActive = (href: string) => {
    if (href === "/app") return location === "/app";
    return location.startsWith(href);
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
          <span className="text-white font-bold text-sm">PH</span>
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <h1 className="font-bold text-slate-900 text-sm leading-tight truncate">PayrollHub</h1>
            <p className="text-[10px] text-slate-400 truncate">Paie & RH Tunisie</p>
          </div>
        )}
      </div>

      <Separator className="mx-3" />

      {/* Navigation */}
      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {/* Main items */}
          {navItems.map((item) => {
            const active = isActive(item.href);
            if (item.disabled) {
              return (
                <div
                  key={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 cursor-not-allowed ${
                    sidebarOpen ? "" : "justify-center"
                  }`}
                >
                  <span className="flex-shrink-0 opacity-40">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="text-sm flex-1 opacity-40">{item.label}</span>
                  )}
                  {sidebarOpen && item.disabledLabel && (
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-400 rounded-full">
                      {item.disabledLabel}
                    </span>
                  )}
                </div>
              );
            }
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group ${
                    sidebarOpen ? "" : "justify-center"
                  } ${
                    active
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={`flex-shrink-0 transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                  )}
                  {sidebarOpen && item.badge !== undefined && item.badge > 0 && (
                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Admin separator */}
          {adminItems.some(isVisible) && (
            <div className="pt-3 pb-1">
              {sidebarOpen && (
                <p className="text-[10px] uppercase font-semibold text-slate-300 tracking-wider px-3 mb-1">
                  Administration
                </p>
              )}
              <Separator className="mx-1" />
            </div>
          )}

          {/* Admin items */}
          {adminItems.filter(isVisible).map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}>
                <div
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 cursor-pointer group ${
                    sidebarOpen ? "" : "justify-center"
                  } ${
                    active
                      ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <span className={`flex-shrink-0 transition-colors ${active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"}`}>
                    {item.icon}
                  </span>
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* User section */}
      <div className="p-3 border-t border-slate-100">
        <div className={`flex items-center gap-3 ${sidebarOpen ? "" : "justify-center"}`}>
          <div className="w-9 h-9 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-blue-700 font-semibold text-xs">
              {user?.prenom?.[0]}{user?.nom?.[0]}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[10px] text-slate-400 truncate">
                {user ? getRoleLabel(user.role) : ""}
              </p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="absolute right-2 top-3">
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>
        <SidebarContent />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-200 flex-shrink-0 ${
          sidebarOpen ? "w-60" : "w-16"
        }`}
      >
        <SidebarContent />
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-5 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm z-10 hidden lg:flex"
          style={{ left: sidebarOpen ? "228px" : "52px" }}
        >
          <ChevronLeft
            size={14}
            className={`transition-transform ${sidebarOpen ? "" : "rotate-180"}`}
          />
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2 text-sm">
              <Building2 size={16} className="text-slate-400" />
              <span className="text-slate-600 font-medium hidden sm:inline">PayrollHub Demo SARL</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition relative">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="lg:hidden flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-blue-700 font-semibold text-xs">
                  {user?.prenom?.[0]}{user?.nom?.[0]}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
