import { cn } from "@/lib/utils";

type StatusType = 'available' | 'occupied' | 'maintenance' | 'on-leave' | 'busy' | 'assigned' | 'working' | 'broken';

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<StatusType, string> = {
    available: 'bg-success/20 text-success border-success/30',
    working: 'bg-success/20 text-success border-success/30',
    occupied: 'bg-warning/20 text-warning border-warning/30',
    busy: 'bg-warning/20 text-warning border-warning/30',
    assigned: 'bg-primary/20 text-primary border-primary/30',
    maintenance: 'bg-muted text-muted-foreground border-border',
    'on-leave': 'bg-muted text-muted-foreground border-border',
    broken: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  const labels: Record<StatusType, string> = {
    available: 'Available',
    working: 'Working',
    occupied: 'Occupied',
    busy: 'Busy',
    assigned: 'Assigned',
    maintenance: 'Maintenance',
    'on-leave': 'On Leave',
    broken: 'Broken',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border uppercase tracking-wide",
      styles[status]
    )}>
      {labels[status]}
    </span>
  );
}
