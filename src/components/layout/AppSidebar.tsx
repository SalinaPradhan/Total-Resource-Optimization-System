import { 
  LayoutDashboard, 
  DoorOpen, 
  Users, 
  UserCog, 
  Package, 
  BookOpen, 
  GraduationCap,
  Calendar,
  Bell,
  Settings,
  Brain,
  ChevronLeft,
  ChevronRight,
  Shield,
  User,
  Crown
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { isAdminOrAbove, isSuperAdmin, isAdmin, isFaculty, isStudent, role } = useAuth();

  const getNavigation = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Timetable', href: '/timetable', icon: Calendar },
    ];

    // Super Admin and Admin (coordinator) see resource management
    if (isAdminOrAbove) {
      const items = [
        ...baseItems,
        { name: 'Rooms', href: '/rooms', icon: DoorOpen },
        { name: 'Faculty', href: '/faculty', icon: Users },
        { name: 'Courses', href: '/courses', icon: BookOpen },
        { name: 'Batches', href: '/batches', icon: GraduationCap },
      ];
      
      // Only super admin sees staff, assets, and coordinator management
      if (isSuperAdmin) {
        items.push(
          { name: 'Support Staff', href: '/staff', icon: UserCog },
          { name: 'Assets', href: '/assets', icon: Package },
        );
      }
      
      return items;
    }

    if (isFaculty) {
      return [
        ...baseItems,
        { name: 'My Dashboard', href: '/my-dashboard', icon: User },
        { name: 'Rooms', href: '/rooms', icon: DoorOpen },
        { name: 'Courses', href: '/courses', icon: BookOpen },
      ];
    }

    if (isStudent) {
      return [
        ...baseItems,
        { name: 'My Schedule', href: '/student-dashboard', icon: GraduationCap },
      ];
    }

    return baseItems;
  };

  const getSecondaryNavigation = () => {
    const items = [];
    
    if (isAdminOrAbove) {
      items.push({ name: 'AI Scheduler', href: '/scheduler', icon: Brain });
    }
    
    items.push({ name: 'Alerts', href: '/alerts', icon: Bell });
    
    if (isAdminOrAbove) {
      items.push({ name: 'Settings', href: '/settings', icon: Settings });
    }
    
    return items;
  };

  const navigation = getNavigation();
  const secondaryNavigation = getSecondaryNavigation();

  const getRoleLabel = () => {
    if (isSuperAdmin) return 'Super Admin';
    if (isAdmin) return 'Coordinator';
    return role;
  };

  return (
    <aside 
      className={cn(
        "flex flex-col h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold gradient-text">TROS</h1>
              <p className="text-[10px] text-muted-foreground -mt-1">Resource Optimizer</p>
            </div>
          )}
        </div>
      </div>

      {/* Role indicator */}
      {!collapsed && role && (
        <div className="px-4 py-2 border-b border-sidebar-border">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium",
            isSuperAdmin ? "bg-warning/10 text-warning" :
            isAdmin ? "bg-destructive/10 text-destructive" :
            isFaculty ? "bg-primary/10 text-primary" :
            "bg-accent/10 text-accent"
          )}>
            {isSuperAdmin ? <Crown className="w-3 h-3" /> : <Shield className="w-3 h-3" />}
            <span className="capitalize">{getRoleLabel()} Access</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {!collapsed && (
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Resources
            </p>
          )}
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "animate-scale-in")} />
                {!collapsed && <span className="animate-fade-in">{item.name}</span>}
              </NavLink>
            );
          })}
        </div>

        {secondaryNavigation.length > 0 && (
          <div className="px-3 mt-6 space-y-1">
            {!collapsed && (
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                System
              </p>
            )}
            {secondaryNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 flex-shrink-0", isActive && "animate-scale-in")} />
                  {!collapsed && <span className="animate-fade-in">{item.name}</span>}
                </NavLink>
              );
            })}
          </div>
        )}
      </nav>

      {/* Collapse Button */}
      <div className="p-3 border-t border-sidebar-border">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="w-full justify-center"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>
    </aside>
  );
}
