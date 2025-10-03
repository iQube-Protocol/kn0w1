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
      // Determine if it's an email or name search
      const isEmail = searchValue.includes('@');
      
      const { data, error } = await supabase.functions.invoke('search-users', {
        body: { 
          email: isEmail ? searchValue : '',
          firstName: !isEmail ? searchValue : '',
          lastName: ''
        }
      });

      if (error) throw error;

      if (data && !data.error) {
        const userName = data.profile 
          ? `${data.profile.first_name || ''} ${data.profile.last_name || ''}`.trim() 
          : 'Unknown';
        
        onUserSelected(data.id, data.email, userName);
        
        toast({
          title: "User Found",
          description: `Selected: ${data.email}`,
        });
        
        setSearchValue('');
      } else {
        toast({
          title: "User Not Found",
          description: "No user found with that email or name.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('[CompactUserSearch] Error:', error);
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
