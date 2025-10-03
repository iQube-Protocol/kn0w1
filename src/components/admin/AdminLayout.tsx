import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from './AdminSidebar';
import { SiteSelector } from './SiteSelector';
import { LogOut, User, Crown, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function AdminLayout() {
  const { user, userRoles, isAdmin, isUberAdmin, hasAgentSite, signOut, loading, currentSiteId, setCurrentSiteId } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { siteId } = useParams();
  const [siteStatus, setSiteStatus] = useState<string>('active');
  const [checkingSiteStatus, setCheckingSiteStatus] = useState(true);

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

  // Sync selected site with URL param for Uber Admins
  React.useEffect(() => {
    if (siteId && setCurrentSiteId && siteId !== currentSiteId) {
      setCurrentSiteId(siteId);
    }
  }, [siteId, setCurrentSiteId]);

  // Check site status and block access to inactive sites
  useEffect(() => {
    if (!loading && (siteId || currentSiteId)) {
      const activeSiteId = siteId || currentSiteId;
      
      const checkStatus = async () => {
        const { data } = await supabase
          .from('agent_sites')
          .select('status')
          .eq('id', activeSiteId)
          .maybeSingle();
        
        if (data) {
          setSiteStatus(data.status);
          
          // Redirect non-uber-admins away from inactive sites
          if (data.status === 'inactive' && !isUberAdmin) {
            navigate('/admin', { replace: true });
          }
        }
        setCheckingSiteStatus(false);
      };
      
      checkStatus();
    }
  }, [loading, siteId, currentSiteId, isUberAdmin, navigate]);

  // Redirect Uber Admins from generic /admin routes to site-scoped routes
  const redirectedRef = React.useRef(false);
  React.useEffect(() => {
    if (!loading && isUberAdmin && currentSiteId && !redirectedRef.current) {
      const path = location.pathname;
      const targetPath = `/admin/${currentSiteId}/overview`;
      
      // If on generic /admin or /admin/overview without siteId in URL, redirect once
      if (!siteId && (path === '/admin' || path === '/admin/overview') && path !== targetPath) {
        if (import.meta.env.DEV) {
          console.debug('[AdminLayout] Redirecting Uber Admin to site-scoped URL:', currentSiteId);
        }
        redirectedRef.current = true;
        navigate(targetPath, { replace: true });
      }
    }
  }, [loading, isUberAdmin, currentSiteId, siteId, location.pathname, navigate]);

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
              
              {/* Site Selector for Uber Admins */}
              <div className="flex-1">
                <SiteSelector />
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {isUberAdmin && (
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-500/10 rounded">
                      <Crown className="h-3.5 w-3.5 text-amber-600" />
                      <span className="text-xs font-semibold text-amber-700">UBER ADMIN</span>
                    </div>
                  )}
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
            {/* Inactive Site Warning for Uber Admins */}
            {!checkingSiteStatus && siteStatus === 'inactive' && isUberAdmin && (
              <Alert variant="destructive" className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Site Inactive</AlertTitle>
                <AlertDescription>
                  This site is currently inactive. Regular users cannot access it. Toggle the status in the Uber Admin site manager to make it accessible.
                </AlertDescription>
              </Alert>
            )}
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}