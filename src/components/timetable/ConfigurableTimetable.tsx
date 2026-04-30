import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Plus, AlertTriangle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { 
  TimetableConfig, 
  TimetableSlotData, 
  DayOfWeek,
  TimeSlotConfig,
  WEEKDAYS_WITH_SATURDAY,
  generateTimeSlots
} from "@/types/timetable";
import { ScheduleSlot } from "@/types";

interface ConfigurableTimetableProps {
  config?: TimetableConfig;
  schedule: ScheduleSlot[];
  onSlotClick?: (slot: ScheduleSlot) => void;
  onEmptySlotClick?: (day: DayOfWeek, timeSlot: TimeSlotConfig) => void;
  editable?: boolean;
  showDepartment?: boolean;
  compactMode?: boolean;
}

const DEFAULT_CONFIG: TimetableConfig = {
  name: 'Default Schedule',
  days: WEEKDAYS_WITH_SATURDAY,
  timeSlots: generateTimeSlots(9, 18, 60)
};

export function ConfigurableTimetable({ 
  config = DEFAULT_CONFIG,
  schedule, 
  onSlotClick, 
  onEmptySlotClick, 
  editable = false,
  showDepartment = false,
  compactMode = false
}: ConfigurableTimetableProps) {
  const { days, timeSlots } = config;

  // Map schedule slots by day and time for quick lookup
  const scheduleMap = useMemo(() => {
    const map = new Map<string, ScheduleSlot>();
    schedule.forEach(slot => {
      const key = `${slot.day}-${slot.startTime}`;
      map.set(key, slot);
    });
    return map;
  }, [schedule]);

  const getSlotForCell = (day: string, time: string): ScheduleSlot | undefined => {
    return scheduleMap.get(`${day}-${time}`);
  };

  const getSlotSpan = (slot: ScheduleSlot): number => {
    const startHour = parseInt(slot.startTime.split(':')[0]);
    const startMin = parseInt(slot.startTime.split(':')[1] || '0');
    const endHour = parseInt(slot.endTime.split(':')[0]);
    const endMin = parseInt(slot.endTime.split(':')[1] || '0');
    
    const startInMinutes = startHour * 60 + startMin;
    const endInMinutes = endHour * 60 + endMin;
    
    // Calculate how many time slots this spans
    const slotDurationMinutes = 60; // Assume 1-hour slots
    return Math.ceil((endInMinutes - startInMinutes) / slotDurationMinutes);
  };

  const hasWarnings = (slot: ScheduleSlot): boolean => {
    return !!(slot.warnings && slot.warnings.length > 0);
  };

  // Track which cells are covered by multi-hour slots
  const coveredCells = useMemo(() => {
    const covered = new Set<string>();
    schedule.forEach(slot => {
      const span = getSlotSpan(slot);
      if (span > 1) {
        const startHour = parseInt(slot.startTime.split(':')[0]);
        for (let i = 1; i < span; i++) {
          const hour = startHour + i;
          const timeKey = `${hour.toString().padStart(2, '0')}:00`;
          covered.add(`${slot.day}-${timeKey}`);
        }
      }
    });
    return covered;
  }, [schedule]);

  const gridCols = days.length + 1; // +1 for time column

  return (
    <TooltipProvider>
      <div className="glass-card rounded-xl border border-border overflow-hidden animate-fade-in">
        <ScrollArea className="w-full">
          <div style={{ minWidth: `${Math.max(900, gridCols * 120)}px` }}>
            {/* Header Row - Days */}
            <div 
              className="grid bg-secondary/50 sticky top-0 z-10"
              style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}
            >
              <div className="p-3 border-b border-r border-border">
                <span className="text-xs font-semibold text-muted-foreground">Time / Day</span>
              </div>
              {days.map(day => (
                <div key={day} className="p-3 border-b border-r border-border last:border-r-0 text-center">
                  <span className="text-xs font-semibold">{day}</span>
                  <span className="text-[10px] text-muted-foreground block md:hidden">
                    {day.slice(0, 3)}
                  </span>
                </div>
              ))}
            </div>

            {/* Time Slot Rows */}
            {timeSlots.map((timeSlot, rowIndex) => (
              <div 
                key={timeSlot.startTime} 
                className="grid"
                style={{ gridTemplateColumns: `100px repeat(${days.length}, 1fr)` }}
              >
                {/* Time Column */}
                <div className={cn(
                  "p-2 border-b border-r border-border bg-secondary/30 flex flex-col items-center justify-center",
                  compactMode ? "py-1" : "py-3"
                )}>
                  <span className="text-xs font-mono font-medium text-foreground">
                    {timeSlot.startTime}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {timeSlot.endTime}
                  </span>
                </div>

                {/* Day Cells */}
                {days.map(day => {
                  const cellKey = `${day}-${timeSlot.startTime}`;
                  
                  // Skip if this cell is covered by a multi-hour slot
                  if (coveredCells.has(cellKey)) {
                    return null;
                  }

                  const slot = getSlotForCell(day, timeSlot.startTime);
                  const hasSlot = !!slot;
                  const span = slot ? getSlotSpan(slot) : 1;

                  return (
                    <div 
                      key={cellKey}
                      className={cn(
                        "border-b border-r border-border last:border-r-0 transition-colors duration-200",
                        compactMode ? "min-h-[60px]" : "min-h-[80px]",
                        hasSlot ? '' : 'hover:bg-secondary/30',
                        editable && !hasSlot && 'cursor-pointer group',
                        "p-1.5"
                      )}
                      style={span > 1 ? { gridRow: `span ${span}` } : undefined}
                      onClick={() => {
                        if (!hasSlot && editable && onEmptySlotClick) {
                          onEmptySlotClick(day, timeSlot);
                        }
                      }}
                    >
                      {slot ? (
                        <TimetableSlot 
                          slot={slot}
                          hasWarnings={hasWarnings(slot)}
                          showDepartment={showDepartment}
                          compactMode={compactMode}
                          editable={editable}
                          onClick={() => onSlotClick?.(slot)}
                        />
                      ) : (
                        editable && (
                          <div className="h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary">
                              <Plus className="w-4 h-4" />
                              <span className="hidden sm:inline">Add</span>
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
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </TooltipProvider>
  );
}

interface TimetableSlotProps {
  slot: ScheduleSlot;
  hasWarnings: boolean;
  showDepartment: boolean;
  compactMode: boolean;
  editable: boolean;
  onClick: () => void;
}

function TimetableSlot({ 
  slot, 
  hasWarnings, 
  showDepartment, 
  compactMode, 
  editable,
  onClick 
}: TimetableSlotProps) {
  const typeColors = {
    lecture: 'bg-primary/20 border-primary/30 hover:bg-primary/30',
    lab: 'bg-accent/20 border-accent/30 hover:bg-accent/30',
    tutorial: 'bg-emerald-500/20 border-emerald-500/30 hover:bg-emerald-500/30'
  };

  const typeBadgeColors = {
    lecture: 'bg-primary/30 text-primary',
    lab: 'bg-accent/30 text-accent',
    tutorial: 'bg-emerald-500/30 text-emerald-600 dark:text-emerald-400'
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={cn(
            "h-full rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] relative",
            typeColors[slot.type],
            hasWarnings && 'ring-2 ring-warning/50',
            compactMode ? "p-1.5" : "p-2"
          )}
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
        >
          <div className="space-y-0.5">
            <p className={cn(
              "font-semibold truncate",
              compactMode ? "text-[10px]" : "text-xs"
            )}>
              {slot.courseName}
            </p>
            <p className={cn(
              "text-muted-foreground truncate",
              compactMode ? "text-[9px]" : "text-[10px]"
            )}>
              {slot.teacherName}
            </p>
            <p className={cn(
              "text-muted-foreground truncate",
              compactMode ? "text-[9px]" : "text-[10px]"
            )}>
              {slot.roomName}
            </p>
            {showDepartment && slot.batchName && (
              <p className={cn(
                "text-muted-foreground truncate",
                compactMode ? "text-[9px]" : "text-[10px]"
              )}>
                {slot.batchName}
              </p>
            )}
            <span className={cn(
              "inline-block font-medium px-1 py-0.5 rounded uppercase",
              typeBadgeColors[slot.type],
              compactMode ? "text-[8px] mt-0.5" : "text-[9px] mt-1"
            )}>
              {slot.type}
            </span>
          </div>
          
          {hasWarnings && (
            <div className="absolute top-1 right-1">
              <AlertTriangle className={cn(
                "text-warning animate-pulse",
                compactMode ? "w-2.5 h-2.5" : "w-3 h-3"
              )} />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent side="right" className="max-w-xs z-50">
        <div className="space-y-1">
          <p className="font-semibold">{slot.courseName}</p>
          <p className="text-xs text-muted-foreground">
            {slot.startTime} - {slot.endTime}
          </p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            <span className="text-muted-foreground">Faculty:</span>
            <span>{slot.teacherName}</span>
            <span className="text-muted-foreground">Room:</span>
            <span>{slot.roomName}</span>
            <span className="text-muted-foreground">Batch:</span>
            <span>{slot.batchName}</span>
            <span className="text-muted-foreground">Type:</span>
            <span className="capitalize">{slot.type}</span>
          </div>
          {hasWarnings && slot.warnings && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-warning font-medium">Warnings:</p>
              {slot.warnings.map((w, i) => (
                <p key={i} className="text-xs text-warning">{w}</p>
              ))}
            </div>
          )}
          {editable && (
            <p className="text-xs text-muted-foreground pt-2 italic">Click to edit</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
