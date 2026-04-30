import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Calendar, Clock, Users, MapPin, BookOpen, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useConflictCheck, ConflictCheckInput, Conflict } from "@/hooks/useConflictCheck";
import { useCourses } from "@/hooks/useCourses";
import { useFaculty } from "@/hooks/useFaculty";
import { useBatches } from "@/hooks/useBatches";
import { useRooms } from "@/hooks/useRooms";
import { useStaff } from "@/hooks/useStaff";
import { ScheduleSlot } from "@/types";
import { cn } from "@/lib/utils";

const scheduleFormSchema = z.object({
  courseId: z.string().min(1, "Course is required"),
  facultyId: z.string().min(1, "Faculty is required"),
  batchId: z.string().min(1, "Batch is required"),
  roomId: z.string().min(1, "Room is required"),
  day: z.string().min(1, "Day is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  type: z.enum(["lecture", "lab", "tutorial"]),
  assignedStaffId: z.string().optional(),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.coerce.number().min(1).max(8),
});

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

interface ScheduleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ScheduleFormValues) => Promise<void>;
  schedule?: ScheduleSlot | null;
  isSubmitting?: boolean;
  defaultDay?: string;
  defaultTime?: string;
}

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = [
  "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"
];

function ConflictWarning({ conflicts }: { conflicts: Conflict[] }) {
  const groupedConflicts = useMemo(() => {
    const grouped: Record<string, Conflict[]> = {
      room: [],
      faculty: [],
      batch: [],
    };
    conflicts.forEach((c) => {
      grouped[c.type].push(c);
    });
    return grouped;
  }, [conflicts]);

  const getIcon = (type: string) => {
    switch (type) {
      case "room": return <MapPin className="w-4 h-4" />;
      case "faculty": return <User className="w-4 h-4" />;
      case "batch": return <Users className="w-4 h-4" />;
      default: return null;
    }
  };

  const getLabel = (type: string) => {
    switch (type) {
      case "room": return "Room Conflict";
      case "faculty": return "Faculty Conflict";
      case "batch": return "Batch Conflict";
      default: return "Conflict";
    }
  };

  return (
    <Alert variant="destructive" className="animate-fade-in">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Scheduling Conflicts Detected</AlertTitle>
      <AlertDescription className="mt-2 space-y-2">
        {Object.entries(groupedConflicts).map(([type, typeConflicts]) =>
          typeConflicts.length > 0 && (
            <div key={type} className="flex items-start gap-2 text-sm">
              {getIcon(type)}
              <div>
                <span className="font-medium">{getLabel(type)}:</span>{" "}
                {typeConflicts.map((c, i) => (
                  <span key={c.conflictingScheduleId}>
                    {c.details.name} ({c.details.time} - {c.details.course})
                    {i < typeConflicts.length - 1 && ", "}
                  </span>
                ))}
              </div>
            </div>
          )
        )}
      </AlertDescription>
    </Alert>
  );
}

export function ScheduleFormDialog({
  open,
  onOpenChange,
  onSubmit,
  schedule,
  isSubmitting,
  defaultDay,
  defaultTime,
}: ScheduleFormDialogProps) {
  const { data: courses } = useCourses();
  const { data: faculty } = useFaculty();
  const { data: batches } = useBatches();
  const { data: rooms } = useRooms();
  const { data: staff } = useStaff();

  const form = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      courseId: "",
      facultyId: "",
      batchId: "",
      roomId: "",
      day: defaultDay || "Monday",
      startTime: defaultTime || "09:00",
      endTime: "10:00",
      type: "lecture",
      assignedStaffId: "",
      academicYear: "2024-2025",
      semester: 1,
    },
  });

  // Reset form when dialog opens/closes or schedule changes
  useEffect(() => {
    if (open) {
      if (schedule) {
        form.reset({
          courseId: schedule.courseId,
          facultyId: schedule.teacherId,
          batchId: schedule.batchId,
          roomId: schedule.roomId,
          day: schedule.day,
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          type: schedule.type,
          assignedStaffId: schedule.assignedStaff || "",
          academicYear: "2024-2025",
          semester: 1,
        });
      } else {
        form.reset({
          courseId: "",
          facultyId: "",
          batchId: "",
          roomId: "",
          day: defaultDay || "Monday",
          startTime: defaultTime || "09:00",
          endTime: defaultTime ? `${parseInt(defaultTime.split(":")[0]) + 1}:00` : "10:00",
          type: "lecture",
          assignedStaffId: "",
          academicYear: "2024-2025",
          semester: 1,
        });
      }
    }
  }, [open, schedule, defaultDay, defaultTime, form]);

  const watchedValues = form.watch();

  // Build conflict check input
  const conflictCheckInput: ConflictCheckInput | null = useMemo(() => {
    if (
      !watchedValues.roomId ||
      !watchedValues.facultyId ||
      !watchedValues.batchId ||
      !watchedValues.day ||
      !watchedValues.startTime ||
      !watchedValues.endTime
    ) {
      return null;
    }
    return {
      roomId: watchedValues.roomId,
      facultyId: watchedValues.facultyId,
      batchId: watchedValues.batchId,
      day: watchedValues.day,
      startTime: watchedValues.startTime,
      endTime: watchedValues.endTime,
      excludeScheduleId: schedule?.id,
    };
  }, [watchedValues, schedule?.id]);

  const { data: conflictResult, isLoading: isCheckingConflicts } = useConflictCheck(conflictCheckInput);

  const handleSubmit = async (data: ScheduleFormValues) => {
    await onSubmit(data);
  };

  // Filter available rooms based on course requirements
  const selectedCourse = courses?.find((c) => c.id === watchedValues.courseId);
  const filteredRooms = useMemo(() => {
    if (!rooms) return [];
    if (!selectedCourse) return rooms;
    
    return rooms.filter((room) => {
      if (selectedCourse.requiresLab && room.type !== "lab") return false;
      if (selectedCourse.requiresProjector && !room.hasProjector) return false;
      return room.status === "available" || room.status === "occupied";
    });
  }, [rooms, selectedCourse]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? "Edit Schedule" : "Create New Schedule"}</DialogTitle>
          <DialogDescription>
            {schedule
              ? "Update the schedule details. Real-time conflict detection is enabled."
              : "Add a new class to the timetable. Conflicts will be detected automatically."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Conflict Warning */}
            {conflictResult?.hasConflicts && (
              <ConflictWarning conflicts={conflictResult.conflicts} />
            )}

            <div className="grid grid-cols-2 gap-4">
              {/* Course */}
              <FormField
                control={form.control}
                name="courseId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Course
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select course" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {courses?.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Faculty */}
              <FormField
                control={form.control}
                name="facultyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Faculty
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn(
                          conflictResult?.conflicts.some(c => c.type === 'faculty') && "border-destructive"
                        )}>
                          <SelectValue placeholder="Select faculty" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {faculty?.filter(f => f.status === 'available').map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Batch */}
              <FormField
                control={form.control}
                name="batchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Batch
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn(
                          conflictResult?.conflicts.some(c => c.type === 'batch') && "border-destructive"
                        )}>
                          <SelectValue placeholder="Select batch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {batches?.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} - Sem {batch.semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Room */}
              <FormField
                control={form.control}
                name="roomId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Room
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn(
                          conflictResult?.conflicts.some(c => c.type === 'room') && "border-destructive"
                        )}>
                          <SelectValue placeholder="Select room" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filteredRooms.map((room) => (
                          <SelectItem key={room.id} value={room.id}>
                            {room.name} ({room.type}, {room.capacity} seats)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Day */}
              <FormField
                control={form.control}
                name="day"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Day
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select day" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {days.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Class Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lecture">Lecture</SelectItem>
                        <SelectItem value="lab">Lab</SelectItem>
                        <SelectItem value="tutorial">Tutorial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Start Time */}
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Start Time
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Start time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Time */}
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      End Time
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="End time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.slice(1).concat(["18:00"]).map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Academic Year */}
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Academic Year</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="2024-2025" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Semester */}
              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Semester</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} min={1} max={8} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Support Staff (for labs) */}
            {watchedValues.type === "lab" && (
              <FormField
                control={form.control}
                name="assignedStaffId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lab Assistant (Optional)</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select lab assistant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {staff?.filter(s => s.role === 'lab-assistant' && s.status === 'available').map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="gradient" 
                disabled={isSubmitting || isCheckingConflicts}
              >
                {isSubmitting ? "Saving..." : schedule ? "Update Schedule" : "Create Schedule"}
              </Button>
              {conflictResult?.hasConflicts && (
                <Button 
                  type="submit" 
                  variant="destructive" 
                  disabled={isSubmitting || isCheckingConflicts}
                  onClick={form.handleSubmit(handleSubmit)}
                >
                  Save Anyway (Override)
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
