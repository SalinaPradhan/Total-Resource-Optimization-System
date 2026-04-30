import { useState, useEffect } from "react";
import { 
  GraduationCap, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  User,
  Loader2,
  School,
  Save,
  Check,
  FileDown
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBatches } from "@/hooks/useBatches";
import { useBatchSchedules } from "@/hooks/useStudentSchedules";
import { useStudentBatchPreference } from "@/hooks/useStudentBatchPreference";
import { exportScheduleToPdf } from "@/lib/exportSchedulePdf";
import { toast } from "sonner";
import type { ScheduleSlot } from "@/types";

const DAY_ORDER: Record<string, number> = {
  'Monday': 0,
  'Tuesday': 1,
  'Wednesday': 2,
  'Thursday': 3,
  'Friday': 4,
  'Saturday': 5,
  'Sunday': 6,
};

const TYPE_COLORS: Record<string, string> = {
  lecture: 'bg-primary/10 text-primary border-primary/20',
  lab: 'bg-accent/10 text-accent border-accent/20',
  tutorial: 'bg-secondary/50 text-secondary-foreground border-secondary',
};

export default function StudentDashboard() {
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: schedules, isLoading: schedulesLoading } = useBatchSchedules(selectedBatchId);
  const { savedBatchId, isLoading: preferenceLoading, saveBatchPreference, isSaving } = useStudentBatchPreference();

  // Load saved batch preference on mount
  useEffect(() => {
    if (savedBatchId && !selectedBatchId) {
      setSelectedBatchId(savedBatchId);
    }
  }, [savedBatchId, selectedBatchId]);

  // Handle batch selection change
  const handleBatchChange = (batchId: string) => {
    setSelectedBatchId(batchId);
    saveBatchPreference(batchId);
  };

  const isBatchSaved = selectedBatchId === savedBatchId;

  const selectedBatch = batches?.find(b => b.id === selectedBatchId);

  // Handle PDF export
  const handleExportPdf = () => {
    if (!schedules || schedules.length === 0 || !selectedBatch) {
      toast.error("No schedule data to export");
      return;
    }

    try {
      exportScheduleToPdf(schedules, {
        batchName: selectedBatch.name,
        stream: selectedBatch.branch,
        semester: selectedBatch.semester,
        year: selectedBatch.year,
      });
      toast.success("Schedule exported to PDF successfully!");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export schedule");
    }
  };

  // Group schedules by day
  const schedulesByDay = (schedules || []).reduce<Record<string, ScheduleSlot[]>>((acc, slot) => {
    if (!acc[slot.day]) acc[slot.day] = [];
    acc[slot.day].push(slot);
    return acc;
  }, {});

  // Sort days
  const sortedDays = Object.keys(schedulesByDay).sort((a, b) => DAY_ORDER[a] - DAY_ORDER[b]);

  // Calculate stats
  const totalClasses = schedules?.length || 0;
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
  const todayClasses = schedulesByDay[todayName]?.length || 0;
  const uniqueCourses = new Set(schedules?.map(s => s.courseId)).size;
  const uniqueFaculty = new Set(schedules?.map(s => s.teacherId)).size;

  if (batchesLoading || preferenceLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Student Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            View your class schedule by selecting your batch
          </p>
        </div>
        {selectedBatchId && schedules && schedules.length > 0 && (
          <Button
            onClick={handleExportPdf}
            variant="outline"
            className="gap-2"
          >
            <FileDown className="w-4 h-4" />
            Export PDF
          </Button>
        )}
      </div>

      {/* Batch Selection Card */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center shrink-0">
              <GraduationCap className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Select Your Batch</label>
                  <div className="flex gap-2">
                    <Select
                      value={selectedBatchId || ""}
                      onValueChange={handleBatchChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose your batch..." />
                      </SelectTrigger>
                      <SelectContent>
                        {batches?.map((batch) => (
                          <SelectItem key={batch.id} value={batch.id}>
                            {batch.name} - {batch.branch} Sem {batch.semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedBatchId && (
                      <div className="flex items-center justify-center w-10 h-10 rounded-md border bg-muted/50">
                        {isSaving ? (
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        ) : isBatchSaved ? (
                          <Check className="w-4 h-4 text-success" />
                        ) : (
                          <Save className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>
                  {isBatchSaved && selectedBatchId && (
                    <p className="text-xs text-success mt-1 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Saved - will load automatically next time
                    </p>
                  )}
                </div>
                {selectedBatch && (
                  <div className="flex flex-wrap items-center gap-4 md:pt-6">
                    <Badge variant="outline" className="gap-1">
                      <School className="w-3 h-3" />
                      {selectedBatch.branch}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      Year {selectedBatch.year}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      Semester {selectedBatch.semester}
                    </Badge>
                    <Badge variant="secondary">
                      {selectedBatch.size} students
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Show content only when batch is selected */}
      {selectedBatchId ? (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalClasses}</p>
                  <p className="text-xs text-muted-foreground">Weekly Classes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{todayClasses}</p>
                  <p className="text-xs text-muted-foreground">Today's Classes</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueCourses}</p>
                  <p className="text-xs text-muted-foreground">Courses</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{uniqueFaculty}</p>
                  <p className="text-xs text-muted-foreground">Faculty</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Weekly Schedule */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                {selectedBatch?.name} - Semester {selectedBatch?.semester}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {schedulesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : sortedDays.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No classes scheduled for this batch</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {sortedDays.map((day) => (
                    <div key={day}>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        {day}
                        {day === todayName && (
                          <Badge variant="secondary" className="text-xs">Today</Badge>
                        )}
                      </h3>
                      <div className="grid gap-3">
                        {schedulesByDay[day]
                          .sort((a, b) => a.startTime.localeCompare(b.startTime))
                          .map((slot) => (
                            <div
                              key={slot.id}
                              className={`p-4 rounded-lg border ${TYPE_COLORS[slot.type]}`}
                            >
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                <div className="flex items-center gap-3">
                                  <div className="text-center min-w-[80px]">
                                    <p className="text-sm font-medium">{slot.startTime.slice(0, 5)}</p>
                                    <p className="text-xs text-muted-foreground">to {slot.endTime.slice(0, 5)}</p>
                                  </div>
                                  <div className="h-10 w-px bg-border" />
                                  <div>
                                    <p className="font-medium flex items-center gap-2">
                                      <BookOpen className="w-4 h-4" />
                                      {slot.courseName}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                      <span className="flex items-center gap-1">
                                        <User className="w-3 h-3" />
                                        {slot.teacherName}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {slot.roomName}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Badge variant="outline" className="capitalize w-fit">
                                  {slot.type}
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-muted-foreground">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Select Your Batch</h3>
            <p className="text-sm max-w-md mx-auto">
              Choose your batch from the dropdown above to view your weekly class schedule, courses, and faculty information.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
