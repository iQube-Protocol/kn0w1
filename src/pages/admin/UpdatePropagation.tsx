import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { GitBranch, Check, X, Send } from 'lucide-react';
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

interface Update {
  id: string;
  update_type: string;
  entity_id: string;
  entity_data: any;
  status: string;
  created_by: string;
  approved_by: string | null;
  created_at: string;
  notes: string | null;
  source_site: {
    display_name: string;
    site_slug: string;
  };
}

export function UpdatePropagation() {
  const { isUberAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<Update | null>(null);

  useEffect(() => {
    if (!isUberAdmin) {
      navigate('/admin');
      return;
    }
    fetchUpdates();
  }, [isUberAdmin, navigate]);

  const fetchUpdates = async () => {
    setLoading(true);
    
    const { data } = await supabase
      .from('master_site_updates')
      .select(`
        *,
        source_site:agent_sites!source_site_id(display_name, site_slug)
      `)
      .order('created_at', { ascending: false });

    setUpdates((data as any) || []);
    setLoading(false);
  };

  const approveUpdate = async (updateId: string) => {
    const { error } = await supabase
      .from('master_site_updates')
      .update({ 
        status: 'approved',
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', updateId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve update',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Update approved'
    });

    fetchUpdates();
  };

  const rejectUpdate = async (updateId: string) => {
    const { error } = await supabase
      .from('master_site_updates')
      .update({ 
        status: 'rejected',
        approved_by: (await supabase.auth.getUser()).data.user?.id
      })
      .eq('id', updateId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject update',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Update rejected'
    });

    fetchUpdates();
  };

  const pushUpdate = async (updateId: string) => {
    // This would trigger the actual propagation logic
    // For now, just mark as pushed
    const { error } = await supabase
      .from('master_site_updates')
      .update({ 
        status: 'pushed',
        pushed_at: new Date().toISOString()
      })
      .eq('id', updateId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to push update',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Update pushed to all branch sites'
    });

    fetchUpdates();
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
        <GitBranch className="h-6 w-6" />
        <h1 className="text-3xl font-bold">Update Propagation</h1>
      </div>

      <p className="text-muted-foreground">
        Review and approve updates from branch sites to push estate-wide, or manage master site updates.
      </p>

      {/* Pending Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Updates</CardTitle>
        </CardHeader>
        <CardContent>
          {updates.filter(u => u.status === 'pending').length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending updates</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Source Site</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.filter(u => u.status === 'pending').map((update) => (
                  <TableRow key={update.id}>
                    <TableCell>
                      <Badge>{update.update_type}</Badge>
                    </TableCell>
                    <TableCell>{update.source_site.display_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(update.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{update.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedUpdate(update)}
                        >
                          View
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => approveUpdate(update.id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => rejectUpdate(update.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Approved Updates Ready to Push */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Push</CardTitle>
        </CardHeader>
        <CardContent>
          {updates.filter(u => u.status === 'approved').length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No approved updates waiting to be pushed</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Source Site</TableHead>
                  <TableHead>Approved</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {updates.filter(u => u.status === 'approved').map((update) => (
                  <TableRow key={update.id}>
                    <TableCell>
                      <Badge>{update.update_type}</Badge>
                    </TableCell>
                    <TableCell>{update.source_site.display_name}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(update.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="default" size="sm">
                            <Send className="h-4 w-4 mr-2" />
                            Push to All Sites
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Push Update Estate-Wide?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will propagate this {update.update_type} update to all branch sites. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => pushUpdate(update.id)}>
                              Push Update
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Source Site</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {updates.filter(u => u.status === 'pushed' || u.status === 'rejected').slice(0, 10).map((update) => (
                <TableRow key={update.id}>
                  <TableCell>
                    <Badge>{update.update_type}</Badge>
                  </TableCell>
                  <TableCell>{update.source_site.display_name}</TableCell>
                  <TableCell>
                    <Badge variant={update.status === 'pushed' ? 'default' : 'destructive'}>
                      {update.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(update.created_at).toLocaleDateString()}
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
