import { LogOut, User, Settings, Shield, GraduationCap, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export function UserMenu() {
  const { user, role, signOut, isAdmin, isFaculty, isStudent } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="w-3 h-3" />;
    if (isFaculty) return <Users className="w-3 h-3" />;
    return <GraduationCap className="w-3 h-3" />;
  };

  const getRoleBadgeStyle = () => {
    if (isAdmin) return 'bg-destructive/20 text-destructive border-destructive/30';
    if (isFaculty) return 'bg-primary/20 text-primary border-primary/30';
    return 'bg-accent/20 text-accent border-accent/30';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 h-auto py-2 px-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-bold text-primary-foreground">
            {user.email?.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.full_name || user.email?.split('@')[0]}
            </p>
            <div className="flex items-center gap-1 mt-1">
              <span className={cn(
                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase",
                getRoleBadgeStyle()
              )}>
                {getRoleIcon()}
                {role || 'User'}
              </span>
            </div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span>{user.user_metadata?.full_name || 'User'}</span>
            <span className="text-xs font-normal text-muted-foreground">{user.email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
