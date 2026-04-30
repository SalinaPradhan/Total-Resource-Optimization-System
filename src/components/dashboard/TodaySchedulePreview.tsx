import { Clock, MapPin, User } from "lucide-react";
import { ScheduleSlot } from "@/types";
import { cn } from "@/lib/utils";

interface TodaySchedulePreviewProps {
  slots: ScheduleSlot[];
}

export function TodaySchedulePreview({ slots }: TodaySchedulePreviewProps) {
  const currentSlots = slots.slice(0, 5);

  return (
    <div className="glass-card rounded-xl border border-border p-5 animate-slide-up" style={{ animationDelay: '250ms' }}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Today's Schedule</h3>
        <span className="text-xs text-muted-foreground">Monday</span>
      </div>

      <div className="space-y-3">
        {currentSlots.map((slot, index) => (
          <div 
            key={slot.id}
            className={cn(
              "p-3 rounded-lg border transition-all duration-200 hover:shadow-md",
              slot.type === 'lab' ? 'status-lab' : 'status-lecture'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-medium text-sm">{slot.courseName}</p>
                <p className="text-xs text-muted-foreground">{slot.batchName}</p>
              </div>
              <span className={cn(
                "text-[10px] font-medium px-2 py-0.5 rounded-full uppercase",
                slot.type === 'lab' ? 'bg-accent/30 text-accent' : 'bg-primary/30 text-primary'
              )}>
                {slot.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {slot.startTime} - {slot.endTime}
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {slot.roomName}
              </div>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {slot.teacherName.split(' ').slice(-1)[0]}
              </div>
            </div>
            {slot.warnings && slot.warnings.length > 0 && (
              <p className="text-[10px] text-warning mt-2 font-medium">
                ⚠ {slot.warnings[0]}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
