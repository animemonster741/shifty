import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Radio, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const validateEmployeeId = (id: string): boolean => {
    const numericRegex = /^\d{4,10}$/;
    return numericRegex.test(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateEmployeeId(employeeId)) {
      setError('Employee ID must be 4-10 digits');
      return;
    }

    setIsLoading(true);
    try {
      const success = await login(employeeId);
      if (success) {
        toast.success('Welcome to NOC Handover');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    setEmployeeId(value);
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <Card className="w-full max-w-md card-elevated relative animate-scale-in">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 shadow-glow">
              <Radio className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">NOC Handover</CardTitle>
          <CardDescription>
            Enter your Employee ID to access the shift management system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input
                id="employeeId"
                type="text"
                inputMode="numeric"
                placeholder="Enter 4-10 digit ID"
                value={employeeId}
                onChange={handleInputChange}
                maxLength={10}
                className="input-noc text-center text-lg tracking-widest"
                autoFocus
              />
              {error && (
                <p className="text-sm text-destructive animate-fade-in">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="glow"
              disabled={!employeeId || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Demo accounts:</p>
            <p className="font-mono text-xs mt-1">
              Manager: 1001, 1002 | Employee: 2001, 2002, 2003
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
