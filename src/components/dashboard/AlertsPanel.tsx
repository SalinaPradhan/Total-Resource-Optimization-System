import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { Alert } from "@/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface AlertsPanelProps {
  alerts: Alert[];
}

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
    }
  };

  const getStyles = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'border-destructive/30 bg-destructive/10';
      case 'warning': return 'border-warning/30 bg-warning/10';
      case 'info': return 'border-primary/30 bg-primary/10';
    }
  };

  const getIconStyles = (type: Alert['type']) => {
    switch (type) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
    }
  };

  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const resolvedAlerts = alerts.filter(a => a.resolved);

  return (
    <div className="glass-card rounded-xl border border-border p-5 animate-slide-up" style={{ animationDelay: '400ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">System Alerts</h3>
        <span className="text-xs text-muted-foreground">{unresolvedAlerts.length} active</span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {unresolvedAlerts.map((alert) => {
          const Icon = getIcon(alert.type);
          return (
            <div
              key={alert.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
                getStyles(alert.type)
              )}
            >
              <div className="flex items-start gap-3">
                <Icon className={cn("w-4 h-4 mt-0.5 flex-shrink-0", getIconStyles(alert.type))} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{alert.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                </div>
              </div>
            </div>
          );
        })}

        {resolvedAlerts.length > 0 && (
          <>
            <div className="border-t border-border my-3" />
            <p className="text-xs text-muted-foreground mb-2">Resolved</p>
            {resolvedAlerts.slice(0, 2).map((alert) => (
              <div
                key={alert.id}
                className="p-3 rounded-lg border border-success/30 bg-success/5 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-success" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{alert.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{alert.message}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <Button variant="outline" className="w-full mt-4" size="sm">
        View All Alerts
      </Button>
    </div>
  );
}
