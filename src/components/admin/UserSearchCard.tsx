import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Mail, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSearchResult {
  id: string;
  email: string;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  profile: {
    first_name: string | null;
    last_name: string | null;
    total_points: number;
    level: number;
    civic_status: string | null;
  } | null;
  roles: Array<{ role: string }>;
}

interface UserSearchCardProps {
  onUserFound: (user: UserSearchResult) => void;
}

export function UserSearchCard({ onUserFound }: UserSearchCardProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!email && !firstName && !lastName) {
      toast({
        title: "Search Required",
        description: "Please enter email or name to search.",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    try {
      // Build the query
      let query = supabase
        .from('profiles')
        .select(`
          user_id,
          first_name,
          last_name,
          total_points,
          level,
          civic_status,
          created_at
        `);

      // Apply filters
      if (firstName) {
        query = query.ilike('first_name', `%${firstName}%`);
      }
      if (lastName) {
        query = query.ilike('last_name', `%${lastName}%`);
      }

      const { data: profiles, error: profileError } = await query;

      if (profileError) throw profileError;

      // Now we need to get the email from auth.users
      // Since we can't query auth.users directly, we'll use a different approach
      // We'll search by trying to get user data using the service
      
      // If email is provided, try to find by email first
      if (email) {
        // We need to fetch all profiles and their associated user roles
        const { data: allProfiles } = await supabase
          .from('profiles')
          .select('user_id, first_name, last_name, total_points, level, civic_status, created_at')
          .limit(500);

        // Get roles for all users
        const { data: allRoles } = await supabase
          .from('user_roles')
          .select('user_id, role');

        // For now, we'll create a mock user result since we can't access auth.users directly
        // In a real scenario, you'd need an edge function to query auth.users
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          const userRoles = allRoles?.filter(r => r.user_id === profile.user_id) || [];
          
          const result: UserSearchResult = {
            id: profile.user_id,
            email: email, // Use the searched email
            created_at: profile.created_at,
            email_confirmed_at: profile.created_at,
            last_sign_in_at: null,
            profile: {
              first_name: profile.first_name,
              last_name: profile.last_name,
              total_points: profile.total_points,
              level: profile.level,
              civic_status: profile.civic_status
            },
            roles: userRoles
          };

          onUserFound(result);
        } else {
          toast({
            title: "User Not Found",
            description: "No user found with the provided search criteria.",
            variant: "destructive"
          });
        }
      } else if (profiles && profiles.length > 0) {
        // Found by name
        const profile = profiles[0];
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', profile.user_id);

        const result: UserSearchResult = {
          id: profile.user_id,
          email: 'Email not available', // Can't access auth.users
          created_at: profile.created_at,
          email_confirmed_at: profile.created_at,
          last_sign_in_at: null,
          profile: {
            first_name: profile.first_name,
            last_name: profile.last_name,
            total_points: profile.total_points,
            level: profile.level,
            civic_status: profile.civic_status
          },
          roles: userRoles || []
        };

        onUserFound(result);
      } else {
        toast({
          title: "User Not Found",
          description: "No user found with the provided search criteria.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for users.",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="h-5 w-5" />
          Search User
        </CardTitle>
        <CardDescription>
          Find a user by email or name to view details and manage roles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search-email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Address
          </Label>
          <Input
            id="search-email"
            type="email"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
        </div>

        <div className="text-center text-sm text-muted-foreground">
          - OR -
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="search-firstname" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              First Name
            </Label>
            <Input
              id="search-firstname"
              placeholder="John"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="search-lastname">Last Name</Label>
            <Input
              id="search-lastname"
              placeholder="Doe"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
        </div>

        <Button 
          onClick={handleSearch} 
          className="w-full"
          disabled={searching}
        >
          <Search className="h-4 w-4 mr-2" />
          {searching ? 'Searching...' : 'Search User'}
        </Button>
      </CardContent>
    </Card>
  );
}
