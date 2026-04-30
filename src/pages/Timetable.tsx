import { useState, useMemo } from "react";
import { Filter, RefreshCw, Plus, Edit, Maximize2, Minimize2, Search, X, FileDown } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { ConfigurableTimetable } from "@/components/timetable/ConfigurableTimetable";
import { TimetableConfigPanel } from "@/components/timetable/TimetableConfigPanel";
import { ScheduleFormDialog } from "@/components/forms/ScheduleFormDialog";
import { DeleteConfirmDialog } from "@/components/forms/DeleteConfirmDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSchedules, useCreateSchedule, useDeleteSchedule } from "@/hooks/useSchedules";
import { useBatches } from "@/hooks/useBatches";
import { useRooms } from "@/hooks/useRooms";
import { useFaculty } from "@/hooks/useFaculty";
import { useAuth } from "@/contexts/AuthContext";
import { ScheduleSlot } from "@/types";
import { toast } from "@/hooks/use-toast";
import { exportScheduleToPdf } from "@/lib/exportSchedulePdf";
import { 
  TimetableConfig, 
  DayOfWeek, 
  TimeSlotConfig,
  WEEKDAYS_WITH_SATURDAY, 
  generateTimeSlots 
} from "@/types/timetable";

export default function Timetable() {
  const { data: schedule, isLoading: schedulesLoading, refetch } = useSchedules();
  const { data: batches, isLoading: batchesLoading } = useBatches();
  const { data: rooms, isLoading: roomsLoading } = useRooms();
  const { data: faculty, isLoading: facultyLoading } = useFaculty();
  const { isAdminOrAbove } = useAuth();
  
  const createSchedule = useCreateSchedule();
  const deleteSchedule = useDeleteSchedule();

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [defaultDay, setDefaultDay] = useState<string | undefined>();
  const [defaultTime, setDefaultTime] = useState<string | undefined>();
  const [editMode, setEditMode] = useState(false);

  // Filters
  const [batchFilter, setBatchFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [roomFilter, setRoomFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("all");
  const [compactMode, setCompactMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  // Timetable configuration
  const [timetableConfig, setTimetableConfig] = useState<TimetableConfig>({
    name: 'Default Schedule',
    days: WEEKDAYS_WITH_SATURDAY,
    timeSlots: generateTimeSlots(9, 18, 60)
  });

  const isLoading = schedulesLoading || batchesLoading || roomsLoading || facultyLoading;

  // Derive available sections from batches
  const availableSections = useMemo(() => {
    if (!batches) return [];
    return [...new Set(batches.map(b => b.section).filter(Boolean))].sort();
  }, [batches]);

  // Get batch IDs for the selected section
  const sectionBatchIds = useMemo(() => {
    if (sectionFilter === "all" || !batches) return null;
    return batches.filter(b => b.section === sectionFilter).map(b => b.id);
  }, [batches, sectionFilter]);

  // Filter schedule data
  const filteredSchedule = useMemo(() => {
    if (!schedule) return [];
    const query = searchQuery.toLowerCase().trim();
    
    return schedule.filter((slot) => {
      // Section filter (applied via batch IDs)
      if (sectionBatchIds && !sectionBatchIds.includes(slot.batchId)) return false;
      if (batchFilter !== "all" && slot.batchId !== batchFilter) return false;
      if (roomFilter !== "all" && slot.roomId !== roomFilter) return false;
      if (facultyFilter !== "all" && slot.teacherId !== facultyFilter) return false;
      if (query) {
        const matchesSearch = 
          slot.courseName?.toLowerCase().includes(query) ||
          slot.teacherName?.toLowerCase().includes(query) ||
          slot.roomName?.toLowerCase().includes(query) ||
          slot.batchName?.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }
      return true;
    });
  }, [schedule, sectionBatchIds, batchFilter, roomFilter, facultyFilter, searchQuery]);

  const handleSlotClick = (slot: ScheduleSlot) => {
    if (editMode) {
      setSelectedSlot(slot);
      setDefaultDay(undefined);
      setDefaultTime(undefined);
      setFormOpen(true);
    }
  };

  const handleEmptySlotClick = (day: DayOfWeek, timeSlot: TimeSlotConfig) => {
    setSelectedSlot(null);
    setDefaultDay(day);
    setDefaultTime(timeSlot.startTime);
    setFormOpen(true);
  };

  const handleAddNew = () => {
    setSelectedSlot(null);
    setDefaultDay(undefined);
    setDefaultTime(undefined);
    setFormOpen(true);
  };

  const handleFormSubmit = async (data: {
    courseId: string;
    facultyId: string;
    batchId: string;
    roomId: string;
    day: string;
    startTime: string;
    endTime: string;
    type: "lecture" | "lab" | "tutorial";
    assignedStaffId?: string;
    academicYear: string;
    semester: number;
  }) => {
    try {
      if (selectedSlot) {
        await deleteSchedule.mutateAsync(selectedSlot.id);
      }
      
      await createSchedule.mutateAsync(data);
      toast({ 
        title: selectedSlot ? "Schedule updated successfully" : "Schedule created successfully" 
      });
      setFormOpen(false);
      refetch();
    } catch (error) {
      toast({ 
        title: "Failed to save schedule", 
        variant: "destructive" 
      });
    }
  };

  const handleDeleteClick = () => {
    if (selectedSlot) {
      setDeleteOpen(true);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlot) return;
    try {
      await deleteSchedule.mutateAsync(selectedSlot.id);
      toast({ title: "Schedule deleted successfully" });
      setDeleteOpen(false);
      setFormOpen(false);
      refetch();
    } catch {
      toast({ title: "Failed to delete schedule", variant: "destructive" });
    }
  };

  const handleExportPdf = () => {
    const dataToExport = filteredSchedule.length > 0 ? filteredSchedule : scheduleData;
    if (dataToExport.length === 0) {
      toast({ title: "No schedule data to export", variant: "destructive" });
      return;
    }
    const selectedBatch = batchFilter !== "all" ? batchData.find(b => b.id === batchFilter) : null;
    exportScheduleToPdf(dataToExport, {
      batchName: selectedBatch?.name ?? "All Batches",
      stream: selectedBatch?.branch ?? "All Branches",
      semester: selectedBatch?.semester ?? 1,
      year: selectedBatch?.year ?? 1,
    });
    toast({ title: "PDF exported successfully" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header title="Timetable" subtitle="Weekly Schedule Overview" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  const scheduleData = schedule ?? [];
  const batchData = batches ?? [];
  const roomData = rooms ?? [];
  const facultyData = faculty ?? [];

  return (
    <div className="min-h-screen">
      <Header 
        title="Timetable" 
        subtitle="Weekly Schedule Overview"
      />
      
      <div className="p-6">
        {/* Section Selector - prominent at the top */}
        {availableSections.length > 0 && (
          <div className="flex items-center gap-3 mb-4 p-3 rounded-lg border border-border bg-card">
            <span className="text-sm font-semibold text-foreground">Section:</span>
            <div className="flex items-center gap-2">
              <Badge 
                variant={sectionFilter === "all" ? "default" : "outline"}
                className="cursor-pointer px-3 py-1"
                onClick={() => setSectionFilter("all")}
              >
                All
              </Badge>
              {availableSections.map(section => (
                <Badge 
                  key={section}
                  variant={sectionFilter === section ? "default" : "outline"}
                  className="cursor-pointer px-3 py-1"
                  onClick={() => setSectionFilter(section)}
                >
                  Section {section}
                </Badge>
              ))}
            </div>
            {sectionFilter !== "all" && (
              <span className="text-xs text-muted-foreground ml-2">
                Showing schedules for Section {sectionFilter} only
              </span>
            )}
          </div>
        )}

        {/* Filters & Actions */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="relative w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search course, faculty, room..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-8 bg-secondary/50 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Filter:</span>
          </div>
          
          <Select value={batchFilter} onValueChange={setBatchFilter}>
            <SelectTrigger className="w-[180px] bg-secondary/50">
              <SelectValue placeholder="Select Batch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Batches</SelectItem>
              {batchData.map(batch => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.name} ({batch.discipline} - {batch.section})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={roomFilter} onValueChange={setRoomFilter}>
            <SelectTrigger className="w-[180px] bg-secondary/50">
              <SelectValue placeholder="Select Room" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Rooms</SelectItem>
              {roomData.map(room => (
                <SelectItem key={room.id} value={room.id}>{room.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={facultyFilter} onValueChange={setFacultyFilter}>
            <SelectTrigger className="w-[180px] bg-secondary/50">
              <SelectValue placeholder="Select Faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculty</SelectItem>
              {facultyData.map(f => (
                <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex-1" />

          <TimetableConfigPanel 
            config={timetableConfig} 
            onConfigChange={setTimetableConfig} 
          />

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
            <Switch
              id="compact-mode"
              checked={compactMode}
              onCheckedChange={setCompactMode}
            />
            <Label htmlFor="compact-mode" className="text-sm cursor-pointer flex items-center gap-1">
              {compactMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              Compact
            </Label>
          </div>

          {isAdminOrAbove && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
              <Switch
                id="edit-mode"
                checked={editMode}
                onCheckedChange={setEditMode}
              />
              <Label htmlFor="edit-mode" className="text-sm cursor-pointer flex items-center gap-1">
                <Edit className="w-4 h-4" />
                Edit Mode
              </Label>
            </div>
          )}

          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>

          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          
          {isAdminOrAbove && (
            <Button variant="gradient" size="sm" onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary/20 border border-primary/30" />
            <span className="text-xs text-muted-foreground">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent/20 border border-accent/30" />
            <span className="text-xs text-muted-foreground">Lab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span className="text-xs text-muted-foreground">Tutorial</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-warning text-xs">⚠</span>
            <span className="text-xs text-muted-foreground">Has Warning</span>
          </div>
          {editMode && (
            <div className="flex items-center gap-2 text-primary">
              <span className="text-xs">Click on slots to edit or empty cells to add</span>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="font-semibold">{scheduleData.length}</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-warning/10">
            <span className="text-sm text-muted-foreground">With Warnings:</span>
            <span className="font-semibold text-warning">
              {scheduleData.filter(s => s.warnings && s.warnings.length > 0).length}
            </span>
          </div>
          {(sectionFilter !== "all" || batchFilter !== "all" || roomFilter !== "all" || facultyFilter !== "all" || searchQuery) && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10">
              <span className="text-sm text-muted-foreground">Filtered:</span>
              <span className="font-semibold text-primary">{filteredSchedule.length}</span>
            </div>
          )}
        </div>

        {/* Timetable Grid */}
        {filteredSchedule.length === 0 && scheduleData.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No schedule found. Use the AI Scheduler or add schedules manually.
          </div>
        ) : (
          <ConfigurableTimetable 
            config={timetableConfig}
            schedule={filteredSchedule} 
            onSlotClick={handleSlotClick}
            onEmptySlotClick={handleEmptySlotClick}
            editable={editMode}
            compactMode={compactMode}
          />
        )}
      </div>

      <ScheduleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        schedule={selectedSlot}
        isSubmitting={createSchedule.isPending || deleteSchedule.isPending}
        defaultDay={defaultDay}
        defaultTime={defaultTime}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title="Delete Schedule"
        description={`Are you sure you want to delete this schedule slot for "${selectedSlot?.courseName}"? This action cannot be undone.`}
        isDeleting={deleteSchedule.isPending}
      />
    </div>
  );
}
