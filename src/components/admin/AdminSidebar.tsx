import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  FileText,
  FolderTree,
  BarChart3,
  Users,
  Share,
  Settings,
  Globe,
  Zap
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    url: '/admin',
    roles: ['super_admin', 'content_admin', 'social_admin']
  },
  {
    title: 'Content',
    icon: FileText,
    url: '/admin/content',
    roles: ['super_admin', 'content_admin']
  },
  {
    title: 'Categories',
    icon: FolderTree,
    url: '/admin/categories',
    roles: ['super_admin', 'content_admin']
  },
  {
    title: 'Analytics',
    icon: BarChart3,
    url: '/admin/analytics',
    roles: ['super_admin', 'content_admin']
  },
  {
    title: 'Social',
    icon: Share,
    url: '/admin/social',
    roles: ['super_admin', 'social_admin']
  },
  {
    title: 'Users & Roles',
    icon: Users,
    url: '/admin/users',
    roles: ['super_admin']
  },
  {
    title: 'Settings',
    icon: Settings,
    url: '/admin/settings',
    roles: ['super_admin']
  }
];

const publicMenuItems = [
  {
    title: 'Civic Readiness',
    icon: Globe,
    url: '/gotv',
    external: true
  },
  {
    title: 'Learn to Earn',
    icon: Zap,
    url: '/l2e',
    external: true
  }
];

export function AdminSidebar() {
  const { userRoles, isAdmin, user } = useAuth();

  const hasRole = (requiredRoles: string[]) => {
    // If user is admin by email (like dele@metame.com), show all menu items
    if (isAdmin && userRoles.length === 0) {
      return true;
    }
    return requiredRoles.some(role => userRoles.includes(role));
  };

  const getNavClasses = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary text-white font-medium" 
      : "text-white hover:bg-accent hover:text-white";

  return (
    <Sidebar className="w-60">
      <SidebarContent>
        {/* Brand */}
        <SidebarGroup>
          <div className="px-3 py-2">
            <h2 className="font-bold text-lg">
              QriptoMedia Admin
            </h2>
          </div>
        </SidebarGroup>

        {/* Admin Menu */}
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems
                .filter(item => hasRole(item.roles))
                .map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        end={item.url === '/admin'}
                        className={getNavClasses}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Access */}
        <SidebarGroup>
          <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {publicMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url}
                      className="hover:bg-accent hover:text-accent-foreground"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}