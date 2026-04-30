import { useState } from "react";
import { 
  User, 
  Calendar, 
  Clock, 
  MapPin, 
  BookOpen, 
  GraduationCap,
  Settings2,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ArrowRightLeft
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCurrentFaculty, useCurrentFacultySchedules } from "@/hooks/useCurrentFaculty";
import { useFacultyAvailability } from "@/hooks/useFacultyAvailability";
import { useFacultySwapRequests, useCreateSwapRequest, useDeleteSwapRequest } from "@/hooks/useSwapRequests";
import { FacultyAvailabilityDialog } from "@/components/forms/FacultyAvailabilityDialog";
import { SwapRequestFormDialog } from "@/components/forms/SwapRequestFormDialog";
import { SwapRequestsPanel } from "@/components/dashboard/SwapRequestsPanel";
import { toast } from "@/hooks/use-toast";
import type { ScheduleSlot } from "@/types";
import type { PreferenceType, DayOfWeek } from "@/types/facultyAvailability";

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const DAY_ORDER: Record<string, number> = {
  'Monday': 0,
  'Tuesday': 1,
  'Wednesday': 2,
  'Thursday': 3,
  'Friday': 4,
  'Saturday': 5,
  'Sunday': 6,
};

const PREFERENCE_COLORS: Record<PreferenceType, string> = {
  preferred: 'bg-success/20 text-success border-success/30',
  available: 'bg-primary/20 text-primary border-primary/30',
  unavailable: 'bg-destructive/20 text-destructive border-destructive/30',
};

const TYPE_COLORS: Record<string, string> = {
  lecture: 'bg-primary/10 text-primary border-primary/20',
  lab: 'bg-accent/10 text-accent border-accent/20',
  tutorial: 'bg-secondary/50 text-secondary-foreground border-secondary',
};

export default function FacultyDashboard() {
  const [availabilityDialogOpen, setAvailabilityDialogOpen] = useState(false);
  const [swapDialogOpen, setSwapDialogOpen] = useState(false);
  const [activeDay, setActiveDay] = useState<DayOfWeek>('Monday');

  const { data: faculty, isLoading: facultyLoading, error: facultyError } = useCurrentFaculty();
  const { data: schedules, isLoading: schedulesLoading } = useCurrentFacultySchedules(faculty?.id);
  const { data: availability, isLoading: availabilityLoading } = useFacultyAvailability(faculty?.id);
  const { data: swapRequests, isLoading: swapLoading } = useFacultySwapRequests(faculty?.id);
  const createSwapRequest = useCreateSwapRequest();
  const deleteSwapRequest = useDeleteSwapRequest();

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
  const preferredSlots = availability?.filter(a => a.preferenceType === 'preferred').length || 0;
  const unavailableSlots = availability?.filter(a => a.preferenceType === 'unavailable').length || 0;

  if (facultyLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (facultyError || !faculty) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center p-8">
        <AlertCircle className="w-12 h-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Faculty Profile Not Found</h2>
        <p className="text-muted-foreground max-w-md">
          Your user account is not linked to a faculty profile. Please contact an administrator to set up your faculty profile.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            View your schedule and manage availability preferences
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSwapDialogOpen(true)} className="gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Request Swap
          </Button>
          <Button onClick={() => setAvailabilityDialogOpen(true)} className="gap-2">
            <Settings2 className="w-4 h-4" />
            Manage Availability
          </Button>
        </div>
      </div>

      {/* Faculty Info Card */}
      <Card className="glass-card border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold text-lg">{faculty.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{faculty.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="font-medium">{faculty.department}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Teaching Load</p>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{faculty.currentLoad} / {faculty.maxLoad} hrs</span>
                  <Badge variant={faculty.currentLoad >= faculty.maxLoad ? "destructive" : "outline"}>
                    {faculty.currentLoad >= faculty.maxLoad ? 'Full' : 'Available'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          {faculty.subjects && faculty.subjects.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground mb-2">Subjects</p>
              <div className="flex flex-wrap gap-2">
                {faculty.subjects.map((subject) => (
                  <Badge key={subject} variant="secondary">{subject}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{preferredSlots}</p>
              <p className="text-xs text-muted-foreground">Preferred Slots</p>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unavailableSlots}</p>
              <p className="text-xs text-muted-foreground">Blocked Slots</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="schedule" className="space-y-4">
        <TabsList>
          <TabsTrigger value="schedule" className="gap-2">
            <Calendar className="w-4 h-4" />
            My Schedule
          </TabsTrigger>
          <TabsTrigger value="availability" className="gap-2">
            <Clock className="w-4 h-4" />
            Availability
          </TabsTrigger>
          <TabsTrigger value="swaps" className="gap-2">
            <ArrowRightLeft className="w-4 h-4" />
            Swap Requests
            {(swapRequests?.filter(r => r.status === 'pending').length || 0) > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-[10px]">
                {swapRequests?.filter(r => r.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Schedule
              </CardTitle>
              <CardDescription>
                Your assigned classes for the week
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
                  <p>No classes scheduled</p>
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
                                        <GraduationCap className="w-3 h-3" />
                                        {slot.batchName}
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
        </TabsContent>

        <TabsContent value="availability">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Availability Preferences
                </CardTitle>
                <CardDescription>
                  Time slots when you prefer to teach or are unavailable
                </CardDescription>
              </div>
              <Button onClick={() => setAvailabilityDialogOpen(true)} size="sm" variant="outline">
                <Settings2 className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </CardHeader>
            <CardContent>
              {availabilityLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !availability || availability.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No availability preferences set</p>
                  <p className="text-sm mt-1">Click "Edit" to define your preferred and unavailable times</p>
                </div>
              ) : (
                <Tabs value={activeDay} onValueChange={(v) => setActiveDay(v as DayOfWeek)}>
                  <TabsList className="grid grid-cols-6 w-full mb-4">
                    {DAYS.map(day => {
                      const daySlots = availability.filter(a => a.dayOfWeek === day);
                      return (
                        <TabsTrigger key={day} value={day} className="text-xs">
                          {day.slice(0, 3)}
                          {daySlots.length > 0 && (
                            <span className="ml-1 w-4 h-4 text-[10px] rounded-full bg-primary/20 text-primary flex items-center justify-center">
                              {daySlots.length}
                            </span>
                          )}
                        </TabsTrigger>
                      );
                    })}
                  </TabsList>

                  {DAYS.map(day => {
                    const daySlots = availability
                      .filter(a => a.dayOfWeek === day)
                      .sort((a, b) => a.startTime.localeCompare(b.startTime));

                    return (
                      <TabsContent key={day} value={day}>
                        <ScrollArea className="h-[300px]">
                          {daySlots.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                              <p>No preferences set for {day}</p>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {daySlots.map((slot) => (
                                <div
                                  key={slot.id}
                                  className={`p-3 rounded-lg border ${PREFERENCE_COLORS[slot.preferenceType]}`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Clock className="w-4 h-4" />
                                      <span className="font-medium">
                                        {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                                      </span>
                                    </div>
                                    <Badge variant="outline" className="capitalize">
                                      {slot.preferenceType}
                                    </Badge>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swaps">
          <SwapRequestsPanel
            requests={swapRequests || []}
            isLoading={swapLoading}
            onDelete={async (id) => {
              try {
                await deleteSwapRequest.mutateAsync(id);
                toast({ title: "Swap request cancelled" });
              } catch {
                toast({ title: "Failed to cancel request", variant: "destructive" });
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Availability Dialog */}
      <FacultyAvailabilityDialog
        open={availabilityDialogOpen}
        onOpenChange={setAvailabilityDialogOpen}
        faculty={faculty}
      />

      {/* Swap Request Dialog */}
      {faculty && schedules && (
        <SwapRequestFormDialog
          open={swapDialogOpen}
          onOpenChange={setSwapDialogOpen}
          schedules={schedules}
          facultyId={faculty.id}
          isSubmitting={createSwapRequest.isPending}
          onSubmit={async (data) => {
            try {
              await createSwapRequest.mutateAsync({
                facultyId: faculty.id,
                ...data,
              });
              toast({ title: "Swap request submitted successfully" });
              setSwapDialogOpen(false);
            } catch {
              toast({ title: "Failed to submit swap request", variant: "destructive" });
            }
          }}
        />
      )}
    </div>
  );
}
