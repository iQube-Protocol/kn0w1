import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CompactUserSearchProps {
  onUserSelected: (userId: string, userEmail: string, userName: string) => void;
}

export function CompactUserSearch({ onUserSelected }: CompactUserSearchProps) {
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({
        title: "Search Required",
        description: "Please enter an email or name to search.",
        variant: "destructive"
      });
      return;
    }

    setSearching(true);
    try {
      const isEmail = searchValue.includes('@');
      
      const { data, error } = await supabase.functions.invoke('search-users', {
        body: { 
          email: isEmail ? searchValue : '',
          firstName: !isEmail ? searchValue : '',
          lastName: ''
        }
      });

      if (error) throw error;

      if (data?.found === false || !data?.matches || data.matches.length === 0) {
        toast({
          title: "User Not Found",
          description: "No user found with that email or name.",
          variant: "destructive"
        });
        return;
      }

      if (data.matches.length === 1) {
        const user = data.matches[0];
        const userName = user.profile 
          ? `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim() 
          : 'Unknown';
        
        onUserSelected(user.id, user.email, userName);
        
        toast({
          title: "User Found",
          description: `Selected: ${user.email}`,
        });
        
        setSearchValue('');
      } else {
        const user = data.matches[0];
        const userName = user.profile 
          ? `${user.profile.first_name || ''} ${user.profile.last_name || ''}`.trim() 
          : 'Unknown';
        
        onUserSelected(user.id, user.email, userName);
        
        toast({
          title: "User Found",
          description: `Selected first match: ${user.email}`,
        });
        
        setSearchValue('');
      }
    } catch (error) {
      console.error('[CompactUserSearch] Error:', error);
      toast({
        title: "User Not Found",
        description: "No user found with that email or name.",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="userSearch">Search by Email or Name</Label>
      <div className="flex gap-2">
        <Input
          id="userSearch"
          placeholder="Enter email or name..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          disabled={searching}
        />
        <Button 
          type="button"
          onClick={handleSearch} 
          disabled={searching}
          size="icon"
        >
          {searching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
