import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  Shield,
  Mail,
  Calendar,
  MoreHorizontal,
  UserCheck,
  UserX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { CreateUserDialog } from '@/components/admin/CreateUserDialog';

interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  email_confirmed_at: string;
}

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
  total_points: number;
  level: number;
  civic_status: string;
}

interface UserRole {
  user_id: string;
  role: string;
}

interface UserWithProfile extends User {
  profile: Profile | null;
  roles: string[];
}

export function UserManagement() {
  const [users, setUsers] = useState<UserWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch users from auth.users (requires service role key in production)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error fetching auth users:', authError);
        // Fallback: just show profiles for existing users
        await fetchProfilesOnly();
        return;
      }

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      // Fetch user roles
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      // Combine data
      const usersWithProfiles: UserWithProfile[] = authUsers.users.map(user => {
        const profile = profiles?.find(p => p.user_id === user.id) || null;
        const roles = userRoles?.filter(r => r.user_id === user.id).map(r => r.role) || [];
        
        return {
          ...user,
          profile,
          roles
        };
      });

      setUsers(usersWithProfiles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users. You may need admin privileges.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProfilesOnly = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const usersFromProfiles: UserWithProfile[] = profiles?.map(profile => ({
        id: profile.user_id,
        email: 'Email not available',
        created_at: '',
        last_sign_in_at: '',
        email_confirmed_at: '',
        profile,
        roles: userRoles?.filter(r => r.user_id === profile.user_id).map(r => r.role) || []
      })) || [];

      setUsers(usersFromProfiles);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const assignRole = async (userId: string, role: 'super_admin' | 'content_admin' | 'social_admin') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${role} assigned successfully.`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error assigning role:', error);
      toast({
        title: "Error",
        description: "Failed to assign role.",
        variant: "destructive"
      });
    }
  };

  const removeRole = async (userId: string, role: 'super_admin' | 'content_admin' | 'social_admin') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Role ${role} removed successfully.`,
      });

      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error removing role:', error);
      toast({
        title: "Error",
        description: "Failed to remove role.",
        variant: "destructive"
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.profile?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || 
                       (roleFilter === 'admin' && user.roles.length > 0) ||
                       (roleFilter === 'user' && user.roles.length === 0) ||
                       user.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions. <strong>Super Admin</strong> = Site owner, <strong>Platform Super Admin</strong> = Full platform access.
          </p>
        </div>
        <CreateUserDialog onUserCreated={fetchUsers} />
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.roles.length > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.roles.length === 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.email_confirmed_at).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="admin">All Admins</SelectItem>
                <SelectItem value="user">Regular Users</SelectItem>
                <SelectItem value="super_admin">Super Admins</SelectItem>
                <SelectItem value="content_admin">Content Admins</SelectItem>
                <SelectItem value="social_admin">Social Admins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {user.profile?.first_name && user.profile?.last_name
                          ? `${user.profile.first_name} ${user.profile.last_name}`
                          : 'Unknown User'
                        }
                      </div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.length > 0 ? (
                        user.roles.map(role => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role.replace('_', ' ')}
                          </Badge>
                        ))
                      ) : (
                        <Badge variant="secondary" className="text-xs">User</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    Level {user.profile?.level || 1}
                  </TableCell>
                  <TableCell>
                    {user.profile?.total_points || 0}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.email_confirmed_at ? "default" : "secondary"}>
                      {user.email_confirmed_at ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => assignRole(user.id, 'super_admin')}>
                          <Shield className="h-4 w-4 mr-2" />
                          Make Super Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => assignRole(user.id, 'content_admin')}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Make Content Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => assignRole(user.id, 'social_admin')}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Make Social Admin
                        </DropdownMenuItem>
                        {user.roles.map(role => (
                          <DropdownMenuItem 
                            key={role}
                            onClick={() => removeRole(user.id, role as any)}
                            className="text-red-600"
                          >
                            <UserX className="h-4 w-4 mr-2" />
                            Remove {role.replace('_', ' ')}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}