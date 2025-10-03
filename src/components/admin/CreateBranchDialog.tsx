import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Loader2 } from "lucide-react";

interface CreateBranchDialogProps {
  onBranchCreated: () => void;
}

export function CreateBranchDialog({ onBranchCreated }: CreateBranchDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [siteSlug, setSiteSlug] = useState("");
  const [ownerType, setOwnerType] = useState<"existing" | "new">("existing");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [users, setUsers] = useState<Array<{ id: string; email: string }>>([]);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserFirstName, setNewUserFirstName] = useState("");
  const [newUserLastName, setNewUserLastName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    const { data } = await supabase.from("profiles").select("user_id, first_name, last_name").order("first_name");
    if (data) {
      const usersWithEmail = await Promise.all(
        data.map(async (profile) => {
          const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id);
          return {
            id: profile.user_id,
            email: userData.user?.email || "Unknown",
            name: `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "Unnamed",
          };
        })
      );
      setUsers(usersWithEmail as any);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (!siteSlug) {
      setSiteSlug(generateSlug(value));
    }
  };

  const validateSlug = async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    const { data } = await supabase.from("agent_sites").select("id").eq("site_slug", slug).maybeSingle();
    return !data;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate slug uniqueness
      const slugAvailable = await validateSlug(siteSlug);
      if (!slugAvailable) {
        toast({
          title: "Slug taken",
          description: "This site slug already exists. Please choose another.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      let ownerId = selectedUserId;

      // Create new user if needed
      if (ownerType === "new") {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: newUserEmail,
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

        ownerId = authData.user.id;

        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: ownerId,
          first_name: newUserFirstName,
          last_name: newUserLastName,
        });

        if (profileError) throw profileError;
      }

      // Create the agent site
      const { data: siteData, error: siteError } = await supabase
        .from("agent_sites")
        .insert({
          display_name: displayName,
          site_slug: siteSlug,
          title: displayName,
          owner_user_id: ownerId,
          is_master: false,
          status: "active",
        })
        .select()
        .single();

      if (siteError) throw siteError;

      // Assign super_admin role to owner
      const { error: roleError } = await supabase.from("user_roles").insert({
        user_id: ownerId,
        role: "super_admin",
        agent_site_id: siteData.id,
        created_by: (await supabase.auth.getUser()).data.user?.id,
      });

      if (roleError) throw roleError;

      toast({
        title: "Branch created",
        description: `${displayName} has been created successfully.`,
      });

      setOpen(false);
      resetForm();
      onBranchCreated();
    } catch (error) {
      console.error("Error creating branch:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create branch",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDisplayName("");
    setSiteSlug("");
    setOwnerType("existing");
    setSelectedUserId("");
    setNewUserEmail("");
    setNewUserFirstName("");
    setNewUserLastName("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create New Branch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Branch Site</DialogTitle>
          <DialogDescription>Create a new agent site and assign an owner with super admin privileges.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Site Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => handleDisplayNameChange(e.target.value)}
              placeholder="My New Agent Site"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="siteSlug">Site Slug</Label>
            <Input
              id="siteSlug"
              value={siteSlug}
              onChange={(e) => setSiteSlug(e.target.value)}
              placeholder="my-new-agent-site"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ownerType">Site Owner</Label>
            <Select value={ownerType} onValueChange={(val) => setOwnerType(val as "existing" | "new")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="existing">Select Existing User</SelectItem>
                <SelectItem value="new">Create New User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {ownerType === "existing" ? (
            <div className="space-y-2">
              <Label htmlFor="owner">Select User</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email} ({(user as any).name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="newUserEmail">Email</Label>
                <Input
                  id="newUserEmail"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="owner@example.com"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={newUserFirstName}
                    onChange={(e) => setNewUserFirstName(e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={newUserLastName}
                    onChange={(e) => setNewUserLastName(e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Branch
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
