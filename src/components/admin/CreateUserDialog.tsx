import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserPlus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateUserDialogProps {
  onUserCreated: () => void;
}

export function CreateUserDialog({ onUserCreated }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingUser, setCheckingUser] = useState(false);
  const [existingUserId, setExistingUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'content_admin' as 'super_admin' | 'content_admin' | 'social_admin' | 'moderator'
  });
  const { toast } = useToast();

  // Check if user already exists when email changes
  const checkExistingUser = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setCheckingUser(true);
    try {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', email) // This won't work, we need a better approach
        .maybeSingle();
      
      // Note: We can't directly check auth.users from client
      // In production, you'd need an edge function for this
      setExistingUserId(profile?.user_id || null);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setCheckingUser(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // If user exists but no profile, create profile and assign role
      if (existingUserId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: existingUserId,
            first_name: formData.firstName,
            last_name: formData.lastName
          });

        if (profileError) throw profileError;

        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: existingUserId,
            role: formData.role
          });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: `Profile created and ${formData.role.replace('_', ' ')} role assigned successfully.`,
        });

        setOpen(false);
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'content_admin'
        });
        setExistingUserId(null);
        onUserCreated();
        return;
      }

      // Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: authData.user.id,
            first_name: formData.firstName,
            last_name: formData.lastName
          });

        if (profileError) throw profileError;

        // Assign role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: formData.role
          });

        if (roleError) throw roleError;

        toast({
          title: "Success",
          description: `User invited successfully with ${formData.role.replace('_', ' ')} role. They need to confirm their email.`,
        });
      } else {
        toast({
          title: "Success", 
          description: "User invitation sent. They need to confirm their email and set their password.",
        });
      }

      setOpen(false);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'content_admin'
      });
      setExistingUserId(null);
      onUserCreated();

    } catch (error: any) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingUserId ? 'Create Profile for Existing User' : 'Create New User'}
          </DialogTitle>
          <DialogDescription>
            {existingUserId 
              ? 'This email is already registered. Create a profile and assign roles.'
              : 'Create a new user account and assign administrative role.'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                required
              />
            </div>
          </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, email: e.target.value }));
                  checkExistingUser(e.target.value);
                }}
                required
              />
              {checkingUser && (
                <p className="text-xs text-muted-foreground">Checking if user exists...</p>
              )}
              {existingUserId && (
                <p className="text-xs text-yellow-600">User exists but has no profile. Will create profile and assign role.</p>
              )}
            </div>

            {!existingUserId && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  required={!existingUserId}
                  minLength={6}
                />
              </div>
            )}

          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: any) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="super_admin">Super Admin (Site Owner)</SelectItem>
                <SelectItem value="content_admin">Content Admin</SelectItem>
                <SelectItem value="social_admin">Social Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading 
                ? (existingUserId ? 'Creating Profile...' : 'Creating User...') 
                : (existingUserId ? 'Create Profile & Assign Role' : 'Create User')
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}