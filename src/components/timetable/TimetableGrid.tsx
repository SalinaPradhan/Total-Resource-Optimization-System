import { ScheduleSlot } from "@/types";
import { cn } from "@/lib/utils";
import { Plus, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface TimetableGridProps {
  schedule: ScheduleSlot[];
  onSlotClick?: (slot: ScheduleSlot) => void;
  onEmptySlotClick?: (day: string, time: string) => void;
  editable?: boolean;
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

export function TimetableGrid({ schedule, onSlotClick, onEmptySlotClick, editable = false }: TimetableGridProps) {
  const getSlotForCell = (day: string, time: string) => {
    return schedule.find(slot => slot.day === day && slot.startTime === time);
  };

  const getSlotDuration = (slot: ScheduleSlot) => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    const endHour = parseInt(slot.endTime.split(':')[0]);
    return endHour - startHour;
  };

  const hasWarnings = (slot: ScheduleSlot) => {
    return slot.warnings && slot.warnings.length > 0;
  };

  return (
    <TooltipProvider>
      <div className="glass-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            {/* Header */}
            <div className="grid grid-cols-7 bg-secondary/50">
              <div className="p-3 border-b border-r border-border">
                <span className="text-xs font-semibold text-muted-foreground">Time</span>
              </div>
              {days.map(day => (
                <div key={day} className="p-3 border-b border-r border-border last:border-r-0">
                  <span className="text-xs font-semibold">{day}</span>
                </div>
              ))}
            </div>

            {/* Grid */}
            {timeSlots.map(time => (
              <div key={time} className="grid grid-cols-7">
                {/* Time column */}
                <div className="p-3 border-b border-r border-border bg-secondary/30 flex items-center">
                  <span className="text-xs font-mono text-muted-foreground">{time}</span>
                </div>

                {/* Day columns */}
                {days.map(day => {
                  const slot = getSlotForCell(day, time);
                  const hasSlot = !!slot;
                  
                  return (
                    <div 
                      key={`${day}-${time}`}
                      className={cn(
                        "p-2 border-b border-r border-border last:border-r-0 min-h-[80px] transition-colors duration-200",
                        hasSlot ? '' : 'hover:bg-secondary/30',
                        editable && !hasSlot && 'cursor-pointer group'
                      )}
                      onClick={() => {
                        if (!hasSlot && editable && onEmptySlotClick) {
                          onEmptySlotClick(day, time);
                        }
                      }}
                    >
                      {slot ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div 
                              className={cn(
                                "h-full rounded-lg p-2 cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative",
                                slot.type === 'lab' 
                                  ? 'bg-accent/20 border border-accent/30 hover:bg-accent/30' 
                                  : 'bg-primary/20 border border-primary/30 hover:bg-primary/30',
                                hasWarnings(slot) && 'ring-2 ring-warning/50'
                              )}
                              onClick={(e) => {
                                e.stopPropagation();
                                onSlotClick?.(slot);
                              }}
                            >
                              <p className="text-xs font-semibold truncate">{slot.courseName}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{slot.teacherName}</p>
                              <p className="text-[10px] text-muted-foreground truncate">{slot.roomName}</p>
                              <span className={cn(
                                "inline-block mt-1 text-[9px] font-medium px-1.5 py-0.5 rounded uppercase",
                                slot.type === 'lab' ? 'bg-accent/30 text-accent' : 'bg-primary/30 text-primary'
                              )}>
                                {slot.type}
                              </span>
                              {hasWarnings(slot) && (
                                <div className="absolute top-1 right-1">
                                  <AlertTriangle className="w-3 h-3 text-warning animate-pulse" />
                                </div>
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="max-w-xs">
                            <div className="space-y-1">
                              <p className="font-semibold">{slot.courseName}</p>
                              <p className="text-xs text-muted-foreground">
                                {slot.startTime} - {slot.endTime}
                              </p>
                              <p className="text-xs">Faculty: {slot.teacherName}</p>
                              <p className="text-xs">Room: {slot.roomName}</p>
                              <p className="text-xs">Batch: {slot.batchName}</p>
                              {hasWarnings(slot) && (
                                <div className="pt-2 border-t border-border">
                                  <p className="text-xs text-warning font-medium">Warnings:</p>
                                  {slot.warnings?.map((w, i) => (
                                    <p key={i} className="text-xs text-warning">{w}</p>
                                  ))}
                                </div>
                              )}
                              {editable && (
                                <p className="text-xs text-muted-foreground pt-2">Click to edit</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        editable && (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Plus className="w-4 h-4" />
                              Add
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
