import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import type { ScheduleSlot } from "@/types";

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface SwapRequestFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedules: ScheduleSlot[];
  facultyId: string;
  onSubmit: (data: {
    scheduleId: string;
    currentDay: string;
    currentStartTime: string;
    currentEndTime: string;
    requestedDay: string;
    requestedStartTime: string;
    requestedEndTime: string;
    reason: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function SwapRequestFormDialog({
  open,
  onOpenChange,
  schedules,
  onSubmit,
  isSubmitting,
}: SwapRequestFormDialogProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState("");
  const [requestedDay, setRequestedDay] = useState("");
  const [requestedStartTime, setRequestedStartTime] = useState("");
  const [requestedEndTime, setRequestedEndTime] = useState("");
  const [reason, setReason] = useState("");

  const selectedSlot = schedules.find(s => s.id === selectedScheduleId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !requestedDay || !requestedStartTime || !requestedEndTime || !reason.trim()) return;

    await onSubmit({
      scheduleId: selectedSlot.id,
      currentDay: selectedSlot.day,
      currentStartTime: selectedSlot.startTime,
      currentEndTime: selectedSlot.endTime,
      requestedDay,
      requestedStartTime,
      requestedEndTime,
      reason: reason.trim(),
    });

    // Reset
    setSelectedScheduleId("");
    setRequestedDay("");
    setRequestedStartTime("");
    setRequestedEndTime("");
    setReason("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Request Schedule Swap</DialogTitle>
          <DialogDescription>
            Propose a time change for one of your classes. Admin will review your request.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Select Class to Swap</Label>
            <Select value={selectedScheduleId} onValueChange={setSelectedScheduleId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a class..." />
              </SelectTrigger>
              <SelectContent>
                {schedules.map(s => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.courseName} — {s.day} {s.startTime}-{s.endTime}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedSlot && (
            <div className="p-3 rounded-lg bg-secondary/50 text-sm space-y-1">
              <p><span className="text-muted-foreground">Current:</span> {selectedSlot.day}, {selectedSlot.startTime} – {selectedSlot.endTime}</p>
              <p><span className="text-muted-foreground">Room:</span> {selectedSlot.roomName}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label>Requested Day</Label>
            <Select value={requestedDay} onValueChange={setRequestedDay}>
              <SelectTrigger>
                <SelectValue placeholder="Select day..." />
              </SelectTrigger>
              <SelectContent>
                {DAYS.map(d => (
                  <SelectItem key={d} value={d}>{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input
                type="time"
                value={requestedStartTime}
                onChange={e => setRequestedStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Time</Label>
              <Input
                type="time"
                value={requestedEndTime}
                onChange={e => setRequestedEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason for Swap</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Explain why you need this time change..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !selectedScheduleId || !requestedDay || !requestedStartTime || !requestedEndTime || !reason.trim()}
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
