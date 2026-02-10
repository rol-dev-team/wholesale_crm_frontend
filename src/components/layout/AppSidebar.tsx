// src/components/layout/AppSidebar.tsx
import {
  Users,
  Building2,
  BarChart3,
  Settings,
  LayoutDashboard,
  ClipboardList,
  Crosshair,
  Trophy,
  ListOrdered,
  ListCheck,
} from 'lucide-react';
import { hasRole } from '@/utility/hasRole';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';

// Main menu items
const allNavItems = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
    roles: ['kam', 'supervisor', 'management', 'super_admin'],
  },
  {
    title: 'Targets',
    url: '/targets',
    icon: Crosshair,
    roles: ['supervisor', 'management', 'super_admin'],
  },
  {
    title: 'KAM Performance',
    url: '/kam-performance',
    icon: Trophy,
    roles: ['supervisor', 'management', 'super_admin'],
  },
  {
    title: 'Activities',
    url: '/activities',
    icon: ClipboardList,
    roles: ['kam', 'supervisor', 'management', 'super_admin'],
  },
  {
    title: 'Clients',
    url: '/clients',
    icon: Building2,
    roles: ['kam', 'supervisor', 'management', 'super_admin'],
  },

  {
    title: 'Price Proposal',
    url: '/order-proposals',
    icon: ListOrdered,
    roles: ['kam', 'supervisor', 'super_admin', 'management'],
  },
  {
    title: 'Approval Requests',
    url: '/order-proposal-list',
    icon: ListCheck,
    roles: ['kam', 'super_admin', 'supervisor', 'management'],
  },
];

// Admin section items
const settingsNavItems = [
  { title: 'Settings', url: '/settings', icon: Settings, roles: ['super_admin'] },
];

export function AppSidebar() {
  const { currentUser } = useAuth();

  if (!currentUser) return null;

  const userRole = currentUser.role.toLowerCase();

  // Filter menu items based on hasRole utility
  const mainNavItems = allNavItems.filter((item) => hasRole(item.roles, userRole));
  const supportNavItems = settingsNavItems.filter((item) => hasRole(item.roles, userRole));

  return (
    <Sidebar className="border-r border-sidebar-border">
      {/* Sidebar Header */}
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-20 h-10 rounded-lg bg- flex items-center justify-center overflow-hidden">
            <img src="earth2.png" alt="CRM Logo" className="w-full h-full object-cover" />
          </div>
        </div>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent className="px-2">
        {/* Main Menu */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-2 py-2">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Section */}
        {supportNavItems.length > 0 && (
          <SidebarGroup className="mt-4">
            <SidebarGroupLabel className="text-xs font-medium text-sidebar-muted uppercase tracking-wider px-2 py-2">
              Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {supportNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className="flex items-center gap-3 px-3 py-2 rounded-md text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                        activeClassName="bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                      >
                        <item.icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-medium text-muted-foreground">
                {currentUser?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('') || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0 hidden sm:block">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {currentUser?.name}
              </p>
              <p className="text-xs text-sidebar-muted truncate capitalize">
                {userRole.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
