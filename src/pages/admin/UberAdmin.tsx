import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Crown, Building2, Users, Shield, Plus, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    if (!isUberAdmin) {
      navigate('/admin');
      return;
    }
    fetchData();
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

  const removeUberAdmin = async (userId: string) => {
    if (userId === user?.id) {
      toast({
        title: 'Error',
        description: 'You cannot remove yourself',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('mm_super_admins')
      .delete()
      .eq('user_id', userId);

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
                      onClick={() => removeUberAdmin(admin.user_id)}
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
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            All Sites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Site Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
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
                      <Badge className="bg-amber-500">Master</Badge>
                    ) : (
                      <Badge variant="secondary">Branch</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.status === 'active' ? 'default' : 'secondary'}>
                      {site.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(site.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
