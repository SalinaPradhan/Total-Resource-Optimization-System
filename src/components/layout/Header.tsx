import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { UserMenu } from "./UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuth();

  return (
    <header className="h-16 border-b border-border bg-background/80 backdrop-blur-sm flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search resources..." 
            className="w-64 pl-9 bg-secondary/50 border-border/50 focus:bg-secondary"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link to="/alerts">
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-destructive">
              3
            </Badge>
          </Link>
        </Button>

        {/* User Menu */}
        {user ? (
          <UserMenu />
        ) : (
          <Button variant="gradient" size="sm" asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        )}
      </div>
    </header>
  );
}
