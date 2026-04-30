import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'accent' | 'warning';
  delay?: number;
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default', delay = 0 }: StatCardProps) {
  const variants = {
    default: 'bg-card border-border',
    primary: 'bg-primary/10 border-primary/20',
    accent: 'bg-accent/10 border-accent/20',
    warning: 'bg-warning/10 border-warning/20',
  };

  const iconVariants = {
    default: 'bg-secondary text-foreground',
    primary: 'bg-primary/20 text-primary',
    accent: 'bg-accent/20 text-accent',
    warning: 'bg-warning/20 text-warning',
  };

  return (
    <div 
      className={cn(
        "glass-card rounded-xl p-5 border transition-all duration-300 hover:shadow-lg animate-slide-up",
        variants[variant]
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
          {trend && (
            <p className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-success" : "text-destructive"
            )}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last week
            </p>
          )}
        </div>
        <div className={cn("p-3 rounded-lg", iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
