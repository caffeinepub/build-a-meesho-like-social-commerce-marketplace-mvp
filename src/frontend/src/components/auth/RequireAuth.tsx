import { ReactNode } from 'react';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';

interface RequireAuthProps {
  children: ReactNode;
}

export default function RequireAuth({ children }: RequireAuthProps) {
  const { identity, login, loginStatus } = useInternetIdentity();

  if (!identity) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Sign In Required</h2>
            <p className="text-muted-foreground">
              You need to sign in to access this page.
            </p>
          </div>
          <Button
            onClick={login}
            disabled={loginStatus === 'logging-in'}
            size="lg"
            className="gap-2"
          >
            <LogIn className="h-5 w-5" />
            {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign In'}
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
