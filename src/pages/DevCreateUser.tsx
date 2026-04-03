import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import type { UserRole } from '@/contexts/AuthContext';

export function DevCreateUserPage() {
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const email = useMemo(() => {
    const normalized = employeeId.trim().replace(/\D/g, '');
    return normalized ? `${normalized}@internal.noc.local` : '';
  }, [employeeId]);

  const canSubmit =
    employeeId.trim().length >= 4 &&
    fullName.trim().length >= 2 &&
    password.length >= 6 &&
    !isSubmitting;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmployeeId = employeeId.trim().replace(/\D/g, '');

    if (normalizedEmployeeId.length < 4 || normalizedEmployeeId.length > 10) {
      toast.error('Employee ID must be 4-10 digits');
      return;
    }
    if (fullName.trim().length < 2) {
      toast.error('Full name is required');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: `${normalizedEmployeeId}@internal.noc.local`,
        password,
        options: {
          data: {
            employee_id: normalizedEmployeeId,
            full_name: fullName.trim(),
            role,
          },
        },
      });

      if (error) throw error;

      // If email confirmations are enabled, this will require confirmation before login.
      // Still useful for creating the user record for testing.
      if (data.user && !data.session) {
        toast.success('User created. Email confirmation may be required before login.');
      } else {
        toast.success('User created and signed in.');
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 max-w-xl">
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle>Create test user (dev only)</CardTitle>
            <CardDescription>
              Creates a Supabase Auth user using the internal email format. This route only exists in local dev.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID (4-10 digits)</Label>
                <Input
                  id="employeeId"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  maxLength={10}
                  className="input-noc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input-noc"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password (min 6 chars)</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-noc"
                />
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={role} onValueChange={(v: UserRole) => setRole(v)}>
                  <SelectTrigger className="input-noc">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="rounded-md border p-3 text-sm">
                <div className="text-muted-foreground">Will create:</div>
                <div className="font-mono">{email || '—'}</div>
              </div>

              <Button type="submit" variant="glow" disabled={!canSubmit}>
                {isSubmitting ? 'Creating…' : 'Create user'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default DevCreateUserPage;
