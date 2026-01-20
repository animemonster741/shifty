import { useState, useEffect } from 'react';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Users, Building2, Loader2, Plus, Shield, User as UserIcon, Pencil, Eye, EyeOff, Key, Check, X, Link as LinkIcon, LayoutDashboard } from 'lucide-react';
import { toast } from 'sonner';
import { z } from 'zod';
import { LinksManagement } from '@/components/admin/LinksManagement';
import { NavigationManagement } from '@/components/admin/NavigationManagement';

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
  employeeId: z.string().regex(/^\d{4,10}$/, 'Employee ID must be 4-10 digits'),
  fullName: z.string().min(2, 'Full name is required').max(100),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const addTeamSchema = z.object({
  name: z.string().min(2, 'Team name must be at least 2 characters').max(100),
});

export function AdminPage() {
  const { user, isAdmin, isLoading: authLoading, session } = useAuth();
  const { t, direction } = useLanguage();
  const navigate = useNavigate();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);
  
  // Add user form
  const [newUserEmployeeId, setNewUserEmployeeId] = useState('');
  const [newUserFullName, setNewUserFullName] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newUserRole, setNewUserRole] = useState<UserRole>('user');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState('');
  
  // Add team form
  const [newTeamName, setNewTeamName] = useState('');
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [addTeamError, setAddTeamError] = useState('');
  
  // Role change
  const [pendingRoleChange, setPendingRoleChange] = useState<{ userId: string; newRole: UserRole } | null>(null);

  // Password reset
  const [passwordResetModal, setPasswordResetModal] = useState<{ open: boolean; user: UserWithRole | null }>({ open: false, user: null });
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  // Team editing
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [isUpdatingTeam, setIsUpdatingTeam] = useState(false);

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
      employeeId: newUserEmployeeId,
      fullName: newUserFullName,
      password: newUserPassword,
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
      // Call edge function to create user
      const { data, error } = await supabase.functions.invoke('admin-create-user', {
        body: {
          employeeId: newUserEmployeeId,
          fullName: newUserFullName,
          password: newUserPassword,
          role: newUserRole,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      toast.success(t('admin.userCreated'));
      setNewUserEmployeeId('');
      setNewUserFullName('');
      setNewUserPassword('');
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
    if (teams.some(team => team.name.toLowerCase() === newTeamName.trim().toLowerCase())) {
      setAddTeamError(t('admin.teamExists'));
      return;
    }

    setIsAddingTeam(true);
    try {
      const { error } = await supabase
        .from('teams')
        .insert({ name: newTeamName.trim(), created_by: user?.id });

      if (error) throw error;

      toast.success(t('admin.teamCreated'));
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
      toast.error(t('admin.cannotRemoveOwnRole'));
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

      toast.success(t('admin.roleUpdated').replace('{role}', newRole === 'admin' ? t('admin.admin') : t('admin.regularUser')));
      fetchUsers();
    } catch (error: any) {
      console.error('Error changing role:', error);
      toast.error(error.message || 'Failed to change role');
    } finally {
      setPendingRoleChange(null);
    }
  };

  const handlePasswordReset = async () => {
    if (!passwordResetModal.user || !newPasswordInput) return;
    
    if (newPasswordInput.length < 6) {
      toast.error(t('settings.passwordMinLength'));
      return;
    }

    setIsResettingPassword(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-reset-password', {
        body: {
          userId: passwordResetModal.user.id,
          newPassword: newPasswordInput,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(t('admin.passwordResetSuccess').replace('{name}', passwordResetModal.user.full_name));
      setPasswordResetModal({ open: false, user: null });
      setNewPasswordInput('');
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleTeamEdit = async (teamId: string, oldName: string) => {
    if (!editingTeamName.trim() || editingTeamName.trim() === oldName) {
      setEditingTeamId(null);
      setEditingTeamName('');
      return;
    }

    // Check for duplicate
    if (teams.some(team => team.id !== teamId && team.name.toLowerCase() === editingTeamName.trim().toLowerCase())) {
      toast.error(t('admin.teamExists'));
      return;
    }

    setIsUpdatingTeam(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-update-team', {
        body: {
          teamId,
          newName: editingTeamName.trim(),
          oldName,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success(t('admin.teamUpdateSuccess'));
      setEditingTeamId(null);
      setEditingTeamName('');
      fetchTeams();
    } catch (error: any) {
      console.error('Error updating team:', error);
      toast.error(error.message || 'Failed to update team');
    } finally {
      setIsUpdatingTeam(false);
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
    <div className="min-h-screen bg-background" dir={direction}>
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{t('admin.title')}</h1>
            <p className="text-muted-foreground">{t('admin.subtitle')}</p>
          </div>
        </div>

        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              {t('admin.userManagement')}
            </TabsTrigger>
            <TabsTrigger value="teams" className="gap-2">
              <Building2 className="h-4 w-4" />
              {t('admin.teamManagement')}
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <LinkIcon className="h-4 w-4" />
              {t('links.manageLinks')}
            </TabsTrigger>
            <TabsTrigger value="navigation" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              {t('nav.menuAndPages')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            {/* Add New User */}
            <Card className="card-elevated">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  {t('admin.addNewUser')}
                </CardTitle>
                <CardDescription>{t('admin.createUserDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="newEmployeeId">{t('auth.employeeId')}</Label>
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
                    <Label htmlFor="newFullName">{t('admin.fullName')}</Label>
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
                    <Label htmlFor="newPassword">{t('auth.password')}</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={newUserPassword}
                        onChange={(e) => { setNewUserPassword(e.target.value); setAddUserError(''); }}
                        className="input-noc pe-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute end-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newRole">{t('admin.role')}</Label>
                    <Select value={newUserRole} onValueChange={(value: UserRole) => setNewUserRole(value)}>
                      <SelectTrigger className="input-noc">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">
                          <div className="flex items-center gap-2">
                            <UserIcon className="h-4 w-4" />
                            {t('admin.regularUser')}
                          </div>
                        </SelectItem>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {t('admin.admin')}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button type="submit" variant="glow" disabled={isAddingUser} className="w-full">
                      {isAddingUser ? (
                        <>
                          <Loader2 className="me-2 h-4 w-4 animate-spin" />
                          {t('admin.adding')}
                        </>
                      ) : (
                        <>
                          <Plus className="me-2 h-4 w-4" />
                          {t('admin.addUser')}
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
                  {t('admin.allUsers')}
                </CardTitle>
                <CardDescription>{t('admin.manageUsersDesc')}</CardDescription>
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
                          <TableHead>{t('auth.employeeId')}</TableHead>
                          <TableHead>{t('admin.fullName')}</TableHead>
                          <TableHead>{t('admin.currentRole')}</TableHead>
                          <TableHead>{t('admin.actions')}</TableHead>
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
                                  <><Shield className="h-3 w-3 me-1" />{t('admin.admin')}</>
                                ) : (
                                  <><UserIcon className="h-3 w-3 me-1" />{t('admin.regularUser')}</>
                                )}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {u.id === user?.id ? (
                                <span className="text-xs text-muted-foreground">{t('admin.you')}</span>
                              ) : (
                                <div className="flex items-center gap-2">
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
                                        <Pencil className="h-4 w-4 me-1" />
                                        {t('admin.changeRole')}
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>{t('admin.confirmRoleChange')}</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          {t('admin.roleChangeConfirmDesc')
                                            .replace('{name}', u.full_name)
                                            .replace('{oldRole}', u.role === 'admin' ? t('admin.admin') : t('admin.regularUser'))
                                            .replace('{newRole}', u.role === 'admin' ? t('admin.regularUser') : t('admin.admin'))}
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel onClick={() => setPendingRoleChange(null)}>
                                          {t('common.cancel')}
                                        </AlertDialogCancel>
                                        <AlertDialogAction onClick={handleRoleChange}>
                                          {t('common.confirm')}
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => {
                                      setPasswordResetModal({ open: true, user: u });
                                      setNewPasswordInput('');
                                    }}
                                  >
                                    <Key className="h-4 w-4 me-1" />
                                    {t('admin.resetPassword')}
                                  </Button>
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
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
                  {t('admin.addNewTeam')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddTeam} className="flex gap-4 items-end">
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="newTeamName">{t('admin.teamName')}</Label>
                    <Input
                      id="newTeamName"
                      type="text"
                      placeholder={t('admin.enterTeamName')}
                      value={newTeamName}
                      onChange={(e) => { setNewTeamName(e.target.value); setAddTeamError(''); }}
                      className="input-noc"
                    />
                  </div>
                  <Button type="submit" variant="glow" disabled={isAddingTeam}>
                    {isAddingTeam ? (
                      <>
                        <Loader2 className="me-2 h-4 w-4 animate-spin" />
                        {t('admin.adding')}
                      </>
                    ) : (
                      <>
                        <Plus className="me-2 h-4 w-4" />
                        {t('admin.addTeam')}
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
                  {t('admin.allTeams')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoadingTeams ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : teams.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">{t('admin.noTeams')}</p>
                ) : (
                  <div className="grid gap-2">
                    {teams.map((team) => (
                      <div 
                        key={team.id} 
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                          {editingTeamId === team.id ? (
                            <Input
                              type="text"
                              value={editingTeamName}
                              onChange={(e) => setEditingTeamName(e.target.value)}
                              className="input-noc flex-1 max-w-xs"
                              placeholder={t('admin.enterNewTeamName')}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  handleTeamEdit(team.id, team.name);
                                } else if (e.key === 'Escape') {
                                  setEditingTeamId(null);
                                  setEditingTeamName('');
                                }
                              }}
                            />
                          ) : (
                            <span className="font-medium">{team.name}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {editingTeamId === team.id ? (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleTeamEdit(team.id, team.name)}
                                disabled={isUpdatingTeam}
                              >
                                {isUpdatingTeam ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-500" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  setEditingTeamId(null);
                                  setEditingTeamName('');
                                }}
                                disabled={isUpdatingTeam}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setEditingTeamId(team.id);
                                setEditingTeamName(team.name);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="space-y-6">
            <LinksManagement />
          </TabsContent>

          <TabsContent value="navigation" className="space-y-6">
            <NavigationManagement />
          </TabsContent>
        </Tabs>

        {/* Password Reset Modal */}
        <Dialog 
          open={passwordResetModal.open} 
          onOpenChange={(open) => {
            if (!open) {
              setPasswordResetModal({ open: false, user: null });
              setNewPasswordInput('');
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('admin.changeUserPassword')}</DialogTitle>
              <DialogDescription>
                {passwordResetModal.user && t('admin.confirmPasswordResetDesc')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newPasswordInput">{t('admin.newPassword')}</Label>
                <div className="relative">
                  <Input
                    id="newPasswordInput"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder={t('admin.enterNewPassword')}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="input-noc pe-10"
                    minLength={6}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute end-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('settings.passwordMinLength')}</p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setPasswordResetModal({ open: false, user: null });
                  setNewPasswordInput('');
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button 
                variant="glow" 
                onClick={handlePasswordReset}
                disabled={isResettingPassword || newPasswordInput.length < 6}
              >
                {isResettingPassword ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    {t('settings.updating')}
                  </>
                ) : (
                  t('admin.saveChanges')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default AdminPage;
