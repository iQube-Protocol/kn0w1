import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { LogOut, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function AdminLayout() {
  const { user, userRoles, isAdmin, hasAgentSite, signOut, loading } = useAuth();
  const navigate = useNavigate();

  // Proper role-based access control
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        console.debug('[AdminLayout] No user, redirecting to /auth');
        navigate('/auth');
      } else if (!isAdmin && userRoles.length === 0) {
        console.debug('[AdminLayout] User has no admin roles, redirecting to /app');
        navigate('/app');
      }
    }
  }, [loading, user, isAdmin, userRoles, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render admin interface for non-admin users
  if (!isAdmin && userRoles.length === 0) {
    return null;
  }


  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Admin Header */}
          <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
            <div className="flex h-14 items-center px-4 gap-4">
              <SidebarTrigger />
              <div className="flex-1" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">{user?.email}</span>
                  {userRoles.map(role => (
                    <Badge key={role} variant="secondary" className="text-xs">
                      {role.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={signOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}