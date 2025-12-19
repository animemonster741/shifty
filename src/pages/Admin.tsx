import { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ArrowLeft, Users, Building2, Loader2, Plus, Shield, User as UserIcon, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';

interface UserWithRole {
  id: string;
  employee_id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
}

const addUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  employeeId: z.string().regex(/^\d{4,10}$/, 'Employee ID must be 4-10 digits'),
  fullName: z.string().min(2, 'Full name is required').max(100),
});

const addTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
});

export function AdminPage() {
  const { user, isAdmin, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  
  // Add user form
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserEmployeeId, setNewUserEmployeeId] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  
  // Add team form
  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [addTeamError, setAddTeamError] = useState('');
  
  // Role change
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: UserRole } | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      navigate('/');
      toast.error('Access denied. Admin privileges required.');
    }
  }, [authLoading, isAdmin, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
      fetchTeams();
    }
  }, [isAdmin]);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => {
        const roleRecord = roles?.find(r => r.user_id === profile.id);
        return {
          id: profile.id,
          employee_id: profile.employee_id,
          full_name: profile.full_name,
          role: (roleRecord?.role as UserRole) || 'user',
          created_at: profile.created_at,
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchTeams = async () => {
    setIsLoadingTeams(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error('Failed to load teams');
    } finally {
      setIsLoadingTeams(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');

    const validation = addUserSchema.safeParse({
      email: newUserEmail,
      employeeId: newUserEmployeeId,
      fullName: newUserFullName,
    });

    if (!validation.success) {
      setAddUserError(validation.error.errors[0].message);
      return;
    }

    // Check if employee ID already exists
    const existingUser = users.find(u => u.employee_id === newUserEmployeeId);
    if (existingUser) {
      setAddUserError('Employee ID already exists');
      return;
    }

    setIsAddingUser(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      // Use admin invite to create user without password
      const { data, error } = await supabase.auth.admin.inviteUserByEmail(newUserEmail, {
        redirectTo: redirectUrl,
        data: {
          employee_id: newUserEmployeeId,
          full_name: newUserFullName,
          role: newUserRole,
        },
      });

      if (error) throw error;

      // Update role if admin
      if (data.user && newUserRole === 'admin') {
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: 'admin' })
          .eq('user_id', data.user.id);

        if (roleError) {
          console.error('Error setting admin role:', roleError);
        }
      }

      toast.success('User invited successfully! They will receive an email to set up their account.');
      setNewUserEmail('');
      setNewUserEmployeeId('');
      setNewUserFullName('');
      setNewUserRole('user');
      fetchUsers();
    } catch (error: any) {
      console.error('Error adding user:', error);
      setAddUserError(error.message || 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddTeamError('');

    const validation = addTeamSchema.safeParse({ name: newTeamName.trim() });
    if (!validation.success) {
      setAddTeamError(validation.error.errors[0].message);
      return;
    }

    // Check for duplicate
    if (teams.some(t => t.name.toLowerCase() === newTeamName.trim().toLowerCase())) {
      setAddTeamError('Team name already exists');
      return;
    }

    setIsAddingTeam(true);
    try {
      const { error } = await supabase
        .from('teams')
        .insert({ name: newTeamName.trim(), created_by: user?.id });

      if (error) throw error;

      toast.success('Team created successfully');
      setNewTeamName('');
      fetchTeams();
    } catch (error: any) {
      console.error('Error adding team:', error);
      setAddTeamError(error.message || 'Failed to add team');
    } finally {
      setIsAddingTeam(false);
    }
  };

  const handleRoleChange = async () => {
    if (!pendingRoleChange) return;

    const { userId, newRole } = pendingRoleChange;
    
    // Prevent admin from removing their own admin role
    if (userId === user?.id && newRole !== 'admin') {
      toast.error('You cannot remove your own admin role');
      setPendingRoleChange(null);
      return;
    }

    try {
      const targetUser = users.find(u => u.id === userId);
      const oldRole = targetUser?.role || 'user';

      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      // Log the role change
      await supabase
        .from('role_change_logs')
        .insert({
          user_id: userId,
          changed_by: user?.id,
          old_role: oldRole,
          new_role: newRole,
        });

      toast.success(`User role updated to ${newRole}`);
      fetchUsers();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast.error(error.message || 'Failed to change role');
    } finally {
      setPendingRoleChange(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage users, roles, and teams</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              User Management
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Building2 className="h-4 w-4" />
              Team Management
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Add New User */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New User
                </CardTitle>
                <CardDescription>Create a new user account with specified role</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="newEmployeeId">Employee ID</Label>
                    <Input
                      id="newEmployeeId"
                      type="text"
                      inputMode="numeric"
                      placeholder="4-10 digits"
                      value={newUserEmployeeId}
                      onChange={(e) => { setNewUserEmployeeId(e.target.value.replace(/\D/g, '')); setAddUserError(''); }}
                      maxLength={10}
                      className="input-noc"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newFullName">Full Name</Label>
                    <Input
                      id="newFullName"
                      type="text"
                      placeholder="John Doe"
                      value={newUserFullName}
                      onChange={(e) => { setNewUserFullName(e.target.value); setAddUserError(''); }}
                      className="input-noc"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newEmail">Email</Label>
                    <Input
                      id="newEmail"
                      type="email"
                      placeholder="user@email.com"
                      value={newUserEmail}
                      onChange={(e) => { setNewUserEmail(e.target.value); setAddUserError(''); }}
                      className="input-noc"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newRole">Role</Label>
                    <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                      <SelectTrigger className="input-noc">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            Regular User
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            Admin
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" variant="glow" disabled={isAddingUser} className="w-full">
                      {isAddingUser ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Add User
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                {addUserError && (
                  <p className="text-sm text-destructive mt-4 animate-fade-in">{addUserError}</p>
                )}
              </CardContent>
            </Card>

            {/* Users List */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  All Users
                </CardTitle>
                <CardDescription>Manage existing user accounts and permissions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingUsers ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee ID</TableHead>
                          <TableHead>Full Name</TableHead>
                          <TableHead>Current Role</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-mono">{u.employee_id}</TableCell>
                            <TableCell>{u.full_name}</TableCell>
                            <TableCell>
                              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                                {u.role === 'admin' ? (
                                  <><Shield className="h-3 w-3 mr-1" />Admin</>
                                ) : (
                                  <><UserIcon className="h-3 w-3 mr-1" />User</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.id === user?.id ? (
                                <span className="text-xs text-muted-foreground">(You)</span>
                              ) : (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => setPendingRoleChange({ 
                                        userId: u.id, 
                                        newRole: u.role === 'admin' ? 'user' : 'admin' 
                                      })}
                                    >
                                      <Pencil className="h-4 w-4 mr-1" />
                                      Change Role
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to change {u.full_name}'s role from{' '}
                                        <strong>{u.role}</strong> to{' '}
                                        <strong>{u.role === 'admin' ? 'user' : 'admin'}</strong>?
                                        This change will take effect immediately.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setPendingRoleChange(null)}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction onClick={handleRoleChange}>
                                        Confirm
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                              No users found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            {/* Add New Team */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add New Team
                </CardTitle>
                <CardDescription>Create a new team for alert assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTeam} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="newTeamName">Team Name</Label>
                    <Input
                      id="newTeamName"
                      type="text"
                      placeholder="Enter team name"
                      value={newTeamName}
                      onChange={(e) => { setNewTeamName(e.target.value); setAddTeamError(''); }}
                      className="input-noc"
                    />
                  </div>
                  <Button type="submit" variant="glow" disabled={isAddingTeam || !newTeamName.trim()}>
                    {isAddingTeam ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Team
                      </>
                    )}
                  </Button>
                </form>
                {addTeamError && (
                  <p className="text-sm text-destructive mt-4 animate-fade-in">{addTeamError}</p>
                )}
              </CardContent>
            </Card>

            {/* Teams List */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  All Teams
                </CardTitle>
                <CardDescription>Teams available for alert assignments and filtering</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTeams ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {teams.map((team) => (
                      <div 
                        key={team.id}
                        className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/20"
                      >
                        <Building2 className="h-5 w-5 text-primary" />
                        <span className="font-medium">{team.name}</span>
                      </div>
                    ))}
                    {teams.length === 0 && (
                      <p className="col-span-full text-center text-muted-foreground py-8">
                        No teams found
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
