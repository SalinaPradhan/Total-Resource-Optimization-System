import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

type AppRole = 'super_admin' | 'admin' | 'faculty' | 'student';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: AppRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If specific roles are required, check if user has one of them
  // super_admin always has access to admin routes
  if (allowedRoles && role) {
    const hasAccess = allowedRoles.includes(role) || 
      (role === 'super_admin' && allowedRoles.includes('admin'));
    
    if (!hasAccess) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center p-8 glass-card rounded-xl border border-border max-w-md">
            <h1 className="text-2xl font-bold text-destructive mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-4">
              You don't have permission to access this page.
              {role === 'student' && ' Contact your administrator for access.'}
            </p>
            <p className="text-sm text-muted-foreground">
              Your current role: <span className="font-semibold capitalize">{role === 'super_admin' ? 'Super Admin' : role}</span>
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
