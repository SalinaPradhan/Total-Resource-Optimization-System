import { Plus, Play, RefreshCw, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function QuickActions() {
  return (
    <div className="glass-card rounded-xl border border-border p-5 animate-slide-up" style={{ animationDelay: '200ms' }}>
      <h3 className="font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        <Button variant="gradient" className="h-auto py-3 flex-col gap-2">
          <Play className="w-5 h-5" />
          <span className="text-xs">Generate Schedule</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-2">
          <Plus className="w-5 h-5" />
          <span className="text-xs">Add Resource</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-2">
          <RefreshCw className="w-5 h-5" />
          <span className="text-xs">Refresh Data</span>
        </Button>
        <Button variant="outline" className="h-auto py-3 flex-col gap-2">
          <Download className="w-5 h-5" />
          <span className="text-xs">Export Report</span>
        </Button>
      </div>
    </div>
  );
}
