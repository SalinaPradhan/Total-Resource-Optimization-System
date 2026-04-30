import { AlertCircle, AlertTriangle, Info, CheckCircle, Filter, RefreshCw } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlerts, useResolveAlert } from "@/hooks/useAlerts";
import { Alert } from "@/types";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AlertsPage() {
  const { data: alerts, isLoading, error, refetch } = useAlerts();
  const resolveAlertMutation = useResolveAlert();

  const getIcon = (type: Alert['type']) => {
    switch (type) {
      case 'error': return AlertCircle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
    }
  };

  const getStyles = (type: Alert['type'], resolved: boolean) => {
    if (resolved) return 'border-success/30 bg-success/5';
    switch (type) {
      case 'error': return 'border-destructive/30 bg-destructive/10';
      case 'warning': return 'border-warning/30 bg-warning/10';
      case 'info': return 'border-primary/30 bg-primary/10';
    }
  };

  const getIconStyles = (type: Alert['type'], resolved: boolean) => {
    if (resolved) return 'text-success';
    switch (type) {
      case 'error': return 'text-destructive';
      case 'warning': return 'text-warning';
      case 'info': return 'text-primary';
    }
  };

  const handleResolve = async (alertId: string) => {
    try {
      await resolveAlertMutation.mutateAsync(alertId);
      toast.success("Alert marked as resolved");
    } catch {
      toast.error("Failed to resolve alert");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="System Alerts" subtitle="Monitor conflicts, warnings, and system notifications" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header title="System Alerts" subtitle="Monitor conflicts, warnings, and system notifications" />
        <div className="p-6">
          <div className="text-destructive">Failed to load alerts. Please try again.</div>
        </div>
      </div>
    );
  }

  const alertData = alerts ?? [];

  return (
    <div className="min-h-screen">
      <Header 
        title="System Alerts" 
        subtitle="Monitor conflicts, warnings, and system notifications"
      />
      
      <div className="p-6">
        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filter:</span>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px] bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Alerts</SelectItem>
                <SelectItem value="error">Errors Only</SelectItem>
                <SelectItem value="warning">Warnings Only</SelectItem>
                <SelectItem value="info">Info Only</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="active">
              <SelectTrigger className="w-[150px] bg-secondary/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="both">All</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <AlertCircle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {alertData.filter(a => a.type === 'error' && !a.resolved).length}
                </p>
                <p className="text-xs text-muted-foreground">Critical Errors</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/20">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {alertData.filter(a => a.type === 'warning' && !a.resolved).length}
                </p>
                <p className="text-xs text-muted-foreground">Warnings</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Info className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {alertData.filter(a => a.type === 'info' && !a.resolved).length}
                </p>
                <p className="text-xs text-muted-foreground">Notifications</p>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-4 border border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/20">
                <CheckCircle className="w-4 h-4 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {alertData.filter(a => a.resolved).length}
                </p>
                <p className="text-xs text-muted-foreground">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts List */}
        {alertData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No alerts found. The system is running smoothly.
          </div>
        ) : (
          <div className="space-y-3">
            {alertData.map((alert, index) => {
              const Icon = alert.resolved ? CheckCircle : getIcon(alert.type);
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "glass-card p-4 rounded-xl border transition-all duration-200 hover:shadow-md animate-slide-up",
                    getStyles(alert.type, alert.resolved)
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn("p-2 rounded-lg", alert.resolved ? 'bg-success/20' : '')}>
                      <Icon className={cn("w-5 h-5", getIconStyles(alert.type, alert.resolved))} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{alert.title}</p>
                          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
                        </div>
                        {!alert.resolved && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleResolve(alert.id)}
                            disabled={resolveAlertMutation.isPending}
                          >
                            Mark Resolved
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[10px] font-medium uppercase",
                          alert.resolved 
                            ? 'bg-success/20 text-success' 
                            : alert.type === 'error' 
                              ? 'bg-destructive/20 text-destructive'
                              : alert.type === 'warning'
                                ? 'bg-warning/20 text-warning'
                                : 'bg-primary/20 text-primary'
                        )}>
                          {alert.resolved ? 'Resolved' : alert.type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
