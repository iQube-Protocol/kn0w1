import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useRoleHierarchy } from "@/hooks/useRoleHierarchy";
import { UserPlus, Trash2, Loader2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface SiteUserManagerProps {
  siteId: string;
  siteName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

interface SiteUser {
  id: string;
  user_id: string;
  role: string;
  email: string;
  name: string;
  created_at: string;
}

export function SiteUserManager({ siteId, siteName, open, onOpenChange, onUpdate }: SiteUserManagerProps) {
  const [siteUsers, setSiteUsers] = useState<SiteUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [searchEmail, setSearchEmail] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [createNewUser, setCreateNewUser] = useState(false);
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const [userToRemove, setUserToRemove] = useState<SiteUser | null>(null);
  const { toast } = useToast();
  const { getAssignableRoles } = useRoleHierarchy();

  useEffect(() => {
    if (open) {
      fetchSiteUsers();
    }
  }, [open, siteId]);

  const fetchSiteUsers = async () => {
    setLoading(true);
    try {
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, created_at")
        .eq("agent_site_id", siteId);

      if (rolesError) throw rolesError;

      const usersWithDetails = await Promise.all(
        (rolesData || []).map(async (roleEntry) => {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("user_id", roleEntry.user_id)
            .single();

          const { data: authData } = await supabase.auth.admin.getUserById(roleEntry.user_id);

          return {
            id: roleEntry.id,
            user_id: roleEntry.user_id,
            role: roleEntry.role,
            email: authData.user?.email || "Unknown",
            name: `${profileData?.first_name || ""} ${profileData?.last_name || ""}`.trim() || "Unnamed",
            created_at: roleEntry.created_at,
          };
        })
      );

      setSiteUsers(usersWithDetails);
    } catch (error) {
      console.error("Error fetching site users:", error);
      toast({
        title: "Error",
        description: "Failed to load site users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchUser = async () => {
    if (!searchEmail) return;

    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      
      const user = data?.users?.find((u: any) => u.email === searchEmail);

      if (user) {
        setSelectedUserId(user.id);
        setCreateNewUser(false);
      } else {
        setCreateNewUser(true);
        setSelectedUserId("");
      }
    } catch (error) {
      console.error("Error searching user:", error);
      toast({
        title: "Error",
        description: "Failed to search for user",
        variant: "destructive",
      });
    }
  };

  const handleAddUser = async () => {
    setLoading(true);
    try {
      let userId = selectedUserId;

      // Create new user if needed
      if (createNewUser) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: searchEmail,
          password: Math.random().toString(36).slice(-12) + "A1!",
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              first_name: newUserFirstName,
              last_name: newUserLastName,
            },
          },
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error("Failed to create user");

        userId = authData.user.id;

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: userId,
          first_name: newUserFirstName,
          last_name: newUserLastName,
        });

        if (profileError) throw profileError;
      }

      // Check if user already has a role for this site
      const { data: existingRole } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .eq("agent_site_id", siteId)
        .maybeSingle();

      if (existingRole) {
        toast({
          title: "User already assigned",
          description: "This user already has a role on this site",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Assign role
      const currentUser = await supabase.auth.getUser();
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: selectedRole as any,
        agent_site_id: siteId,
        created_by: currentUser.data.user?.id,
      });

      if (roleError) throw roleError;

      toast({
        title: "User added",
        description: `User has been assigned the ${selectedRole} role`,
      });

      setShowAddUser(false);
      resetAddUserForm();
      fetchSiteUsers();
      onUpdate();
    } catch (error) {
      console.error("Error adding user:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!userToRemove) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("user_roles").delete().eq("id", userToRemove.id);

      if (error) throw error;

      toast({
        title: "User removed",
        description: "User has been removed from this site",
      });

      setUserToRemove(null);
      fetchSiteUsers();
      onUpdate();
    } catch (error) {
      console.error("Error removing user:", error);
      toast({
        title: "Error",
        description: "Failed to remove user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetAddUserForm = () => {
    setSearchEmail("");
    setSelectedUserId("");
    setSelectedRole("");
    setCreateNewUser(false);
    setNewUserFirstName("");
    setNewUserLastName("");
  };

  const assignableRoles = getAssignableRoles().filter((role) => role !== "uber_admin");

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Manage Users - {siteName}</DialogTitle>
            <DialogDescription>Add or remove users and assign roles for this site.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Site Users</h3>
              <Button size="sm" onClick={() => setShowAddUser(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Added</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {siteUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No users assigned to this site
                      </TableCell>
                    </TableRow>
                  ) : (
                    siteUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>
                          <span className="capitalize">{user.role.replace("_", " ")}</span>
                        </TableCell>
                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost" onClick={() => setUserToRemove(user)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to Site</DialogTitle>
            <DialogDescription>Search for an existing user or create a new one.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="searchEmail">Email</Label>
              <div className="flex gap-2">
                <Input
                  id="searchEmail"
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="user@example.com"
                />
                <Button onClick={handleSearchUser} disabled={!searchEmail}>
                  Search
                </Button>
              </div>
            </div>

            {createNewUser && (
              <div className="space-y-4 p-4 border rounded-md">
                <p className="text-sm text-muted-foreground">User not found. Create a new user:</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={newUserFirstName}
                      onChange={(e) => setNewUserFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={newUserLastName}
                      onChange={(e) => setNewUserLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>
            )}

            {(selectedUserId || createNewUser) && (
              <div className="space-y-2">
                <Label htmlFor="role">Assign Role</Label>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {assignableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        <span className="capitalize">{role.replace("_", " ")}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddUser(false)} disabled={loading}>
                Cancel
              </Button>
              <Button onClick={handleAddUser} disabled={!selectedRole || loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Add User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove User Confirmation */}
      <AlertDialog open={!!userToRemove} onOpenChange={() => setUserToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {userToRemove?.email} from this site? This will revoke their {userToRemove?.role} role.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
