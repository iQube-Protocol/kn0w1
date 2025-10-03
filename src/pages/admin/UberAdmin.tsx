import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Crown, Building2, Users, Plus, Trash2, UserCog } from 'lucide-react';
import { CreateBranchDialog } from '@/components/admin/CreateBranchDialog';
import { SiteUserManager } from '@/components/admin/SiteUserManager';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Site {
  id: string;
  display_name: string;
  site_slug: string;
  is_master: boolean;
  owner_user_id: string;
  status: string;
  created_at: string;
}

interface UberAdminUser {
  user_id: string;
  email: string;
}

export function UberAdmin() {
  const { isUberAdmin, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sites, setSites] = useState<Site[]>([]);
  const [uberAdmins, setUberAdmins] = useState<UberAdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSiteForUsers, setSelectedSiteForUsers] = useState<{ id: string; name: string } | null>(null);
  const [siteUserCounts, setSiteUserCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!isUberAdmin) {
      navigate('/admin');
      return;
    }
    fetchData();

    // Refetch on window focus
    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isUberAdmin, navigate]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch all sites
    const { data: sitesData } = await supabase
      .from('agent_sites')
      .select('id, display_name, site_slug, is_master, owner_user_id, status, created_at')
      .order('is_master', { ascending: false })
      .order('display_name');

    // Fetch all uber admins with email from auth.users via profiles
    const { data: adminsData } = await supabase
      .from('mm_super_admins')
      .select('user_id, email');

    // Fetch user counts for each site
    if (sitesData) {
      const counts: Record<string, number> = {};
      for (const site of sitesData) {
        const { count } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('agent_site_id', site.id);
        counts[site.id] = count || 0;
      }
      setSiteUserCounts(counts);
    }

    setSites((sitesData as Site[]) || []);
    setUberAdmins((adminsData as UberAdminUser[]) || []);
    setLoading(false);
  };

  const addUberAdmin = async () => {
    if (!newAdminEmail.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('mm_super_admins')
      .insert({
        email: newAdminEmail,
        user_id: null  // Will be linked when user signs up
      });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to add Uber Admin',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Uber Admin added successfully'
    });

    setNewAdminEmail('');
    fetchData();
  };

  const removeUberAdmin = async (userId: string | null, email: string) => {
    if (userId === user?.id) {
      toast({
        title: 'Error',
        description: 'You cannot remove yourself',
        variant: 'destructive'
      });
      return;
    }

    // Delete by user_id if available, otherwise by email
    const { error } = userId 
      ? await supabase.from('mm_super_admins').delete().eq('user_id', userId)
      : await supabase.from('mm_super_admins').delete().eq('email', email);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to remove Uber Admin',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Uber Admin removed successfully'
    });

    fetchData();
  };

  const deleteSite = async (siteId: string) => {
    const { error } = await supabase
      .from('agent_sites')
      .delete()
      .eq('id', siteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete site',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Site deleted successfully'
    });

    fetchData();
  };

  const toggleSiteStatus = async (siteId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const { error } = await supabase
      .from('agent_sites')
      .update({ status: newStatus })
      .eq('id', siteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update site status',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: `Site is now ${newStatus}`
    });

    fetchData();
  };

  const setMasterSite = async (siteId: string) => {
    // First, unset any existing master site
    await supabase
      .from('agent_sites')
      .update({ is_master: false })
      .eq('is_master', true);

    // Then set the new master site
    const { error } = await supabase
      .from('agent_sites')
      .update({ is_master: true })
      .eq('id', siteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to set master site',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Master site updated successfully'
    });

    fetchData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Crown className="h-6 w-6 text-amber-500" />
        <h1 className="text-3xl font-bold">Uber Admin Dashboard</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sites</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Master Sites</CardTitle>
            <Crown className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sites.filter(s => s.is_master).length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uber Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uberAdmins.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Uber Admins Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            Uber Admins
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter email to add Uber Admin"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
            />
            <Button onClick={addUberAdmin}>
              <Plus className="h-4 w-4 mr-2" />
              Add
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uberAdmins.map((admin) => (
                <TableRow key={admin.user_id || admin.email}>
                  <TableCell className="font-medium">{admin.email}</TableCell>
                  <TableCell className="font-mono text-xs">{admin.user_id || 'Pending signup'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeUberAdmin(admin.user_id, admin.email)}
                      disabled={admin.user_id === user?.id}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sites Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              All Sites
            </CardTitle>
            <CreateBranchDialog onBranchCreated={fetchData} />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.display_name}</TableCell>
                  <TableCell className="font-mono text-xs">{site.site_slug}</TableCell>
                  <TableCell>
                    {site.is_master ? (
                      <Badge className="bg-primary text-primary-foreground hover:bg-amber-500 hover:text-background">Master</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-white">Branch</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{siteUserCounts[site.id] || 0}</span>
                      {siteUserCounts[site.id] === 0 && (
                        <Badge variant="destructive" className="text-xs">No admins</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={site.status === 'active'}
                        onCheckedChange={() => toggleSiteStatus(site.id, site.status)}
                      />
                      <span className="text-sm">{site.status}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(site.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSiteForUsers({ id: site.id, name: site.display_name })}
                      >
                        <UserCog className="h-4 w-4 mr-1" />
                        Users
                      </Button>
                      {!site.is_master && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setMasterSite(site.id)}
                        >
                          Set as Master
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/setup?edit=${site.id}`)}
                      >
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Site</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{site.display_name}"? This action cannot be undone and will delete all associated data including branches, pillars, content, and roles.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteSite(site.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Site User Manager Dialog */}
      {selectedSiteForUsers && (
        <SiteUserManager
          siteId={selectedSiteForUsers.id}
          siteName={selectedSiteForUsers.name}
          open={!!selectedSiteForUsers}
          onOpenChange={(open) => !open && setSelectedSiteForUsers(null)}
          onUpdate={fetchData}
        />
      )}
    </div>
  );
}
