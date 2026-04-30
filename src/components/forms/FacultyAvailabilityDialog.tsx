import { useState, useEffect } from "react";
import { Clock, Plus, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFacultyAvailability, useBulkSaveFacultyAvailability } from "@/hooks/useFacultyAvailability";
import { toast } from "@/hooks/use-toast";
import type { Faculty } from "@/types";
import type { DayOfWeek, PreferenceType, FacultyAvailability } from "@/types/facultyAvailability";

interface FacultyAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faculty: Faculty | null;
}

interface SlotInput {
  id?: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  preferenceType: PreferenceType;
  isNew?: boolean;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const PREFERENCE_COLORS: Record<PreferenceType, string> = {
  preferred: 'bg-success/20 text-success border-success/30',
  available: 'bg-primary/20 text-primary border-primary/30',
  unavailable: 'bg-destructive/20 text-destructive border-destructive/30',
};

const PREFERENCE_LABELS: Record<PreferenceType, string> = {
  preferred: 'Preferred',
  available: 'Available',
  unavailable: 'Unavailable',
};

export function FacultyAvailabilityDialog({
  open,
  onOpenChange,
  faculty,
}: FacultyAvailabilityDialogProps) {
  const [slots, setSlots] = useState<SlotInput[]>([]);
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');

  const { data: existingSlots, isLoading } = useFacultyAvailability(faculty?.id);
  const bulkSave = useBulkSaveFacultyAvailability();

  useEffect(() => {
    if (existingSlots && open) {
      setSlots(existingSlots.map(slot => ({
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime.slice(0, 5),
        endTime: slot.endTime.slice(0, 5),
        preferenceType: slot.preferenceType,
      })));
    } else if (!open) {
      setSlots([]);
    }
  }, [existingSlots, open]);

  const addSlot = (day: DayOfWeek) => {
    setSlots(prev => [
      ...prev,
      {
        dayOfWeek: day,
        startTime: '09:00',
        endTime: '10:00',
        preferenceType: 'available',
        isNew: true,
      },
    ]);
  };

  const updateSlot = (index: number, field: keyof SlotInput, value: string) => {
    setSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const removeSlot = (index: number) => {
    setSlots(prev => prev.filter((_, i) => i !== index));
  };

  const getSlotsForDay = (day: DayOfWeek) => {
    return slots
      .map((slot, index) => ({ ...slot, originalIndex: index }))
      .filter(slot => slot.dayOfWeek === day);
  };

  const handleSave = async () => {
    if (!faculty) return;

    // Validate time ranges
    const invalidSlots = slots.filter(slot => slot.startTime >= slot.endTime);
    if (invalidSlots.length > 0) {
      toast({
        title: "Invalid time range",
        description: "End time must be after start time for all slots.",
        variant: "destructive",
      });
      return;
    }

    try {
      await bulkSave.mutateAsync({
        facultyId: faculty.id,
        slots: slots.map(({ dayOfWeek, startTime, endTime, preferenceType }) => ({
          dayOfWeek,
          startTime,
          endTime,
          preferenceType,
        })),
      });
      toast({ title: "Availability preferences saved" });
      onOpenChange(false);
    } catch {
      toast({
        title: "Failed to save preferences",
        variant: "destructive",
      });
    }
  };

  const totalSlots = slots.length;
  const preferredCount = slots.filter(s => s.preferenceType === 'preferred').length;
  const unavailableCount = slots.filter(s => s.preferenceType === 'unavailable').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability Preferences
          </DialogTitle>
          <DialogDescription>
            Set when {faculty?.name} is available, preferred, or unavailable to teach.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-4 py-2 border-b">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={PREFERENCE_COLORS.preferred}>
              Preferred: {preferredCount}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={PREFERENCE_COLORS.available}>
              Available: {totalSlots - preferredCount - unavailableCount}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={PREFERENCE_COLORS.unavailable}>
              Unavailable: {unavailableCount}
            </Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading preferences...
          </div>
        ) : (
          <Tabs value={activeDay} onValueChange={(v) => setActiveDay(v as DayOfWeek)}>
            <TabsList className="grid grid-cols-6 w-full">
              {DAYS.map(day => (
                <TabsTrigger key={day} value={day} className="text-xs">
                  {day.slice(0, 3)}
                  {getSlotsForDay(day).length > 0 && (
                    <span className="ml-1 w-4 h-4 text-[10px] rounded-full bg-primary/20 text-primary flex items-center justify-center">
                      {getSlotsForDay(day).length}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {DAYS.map(day => (
              <TabsContent key={day} value={day} className="mt-4">
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-3">
                    {getSlotsForDay(day).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No preferences set for {day}</p>
                        <p className="text-xs">Click "Add Time Slot" to define availability</p>
                      </div>
                    ) : (
                      getSlotsForDay(day).map((slot) => (
                        <div
                          key={slot.originalIndex}
                          className={`flex items-center gap-3 p-3 rounded-lg border ${PREFERENCE_COLORS[slot.preferenceType]}`}
                        >
                          <div className="flex-1 grid grid-cols-4 gap-3 items-center">
                            <div>
                              <Label className="text-xs mb-1 block">Start</Label>
                              <Select
                                value={slot.startTime}
                                onValueChange={(v) => updateSlot(slot.originalIndex, 'startTime', v)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="text-xs mb-1 block">End</Label>
                              <Select
                                value={slot.endTime}
                                onValueChange={(v) => updateSlot(slot.originalIndex, 'endTime', v)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {TIME_SLOTS.map(time => (
                                    <SelectItem key={time} value={time}>{time}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="col-span-2">
                              <Label className="text-xs mb-1 block">Preference</Label>
                              <Select
                                value={slot.preferenceType}
                                onValueChange={(v) => updateSlot(slot.originalIndex, 'preferenceType', v)}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="preferred">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-success" />
                                      Preferred
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="available">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-primary" />
                                      Available
                                    </span>
                                  </SelectItem>
                                  <SelectItem value="unavailable">
                                    <span className="flex items-center gap-2">
                                      <span className="w-2 h-2 rounded-full bg-destructive" />
                                      Unavailable
                                    </span>
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={() => removeSlot(slot.originalIndex)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>

                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 w-full"
                  onClick={() => addSlot(day)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Time Slot for {day}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={bulkSave.isPending}>
            {bulkSave.isPending ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
