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
      // Call edge function to search all users in the database
      const { data, error } = await supabase.functions.invoke('search-users', {
        body: { email, firstName, lastName }
      });

      if (error) {
        console.error('[UserSearchCard] Edge function error:', error);
        throw error;
      }

      if (data && !data.error) {
        console.log('[UserSearchCard] Found user:', data.email);
        onUserFound(data);
      } else {
        toast({
          title: "User Not Found",
          description: data?.error || "No user found with the provided search criteria.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[UserSearchCard] Error searching users:', error);
      toast({
        title: "Search Error",
        description: "Failed to search for users. Please try again.",
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
