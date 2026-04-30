import { useState } from "react";
import { Settings, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  TimetableConfig,
  DayOfWeek,
  ALL_DAYS,
  PRESET_CONFIGS,
  PresetConfigKey,
  generateTimeSlots
} from "@/types/timetable";

interface TimetableConfigPanelProps {
  config: TimetableConfig;
  onConfigChange: (config: TimetableConfig) => void;
}

export function TimetableConfigPanel({ config, onConfigChange }: TimetableConfigPanelProps) {
  const [open, setOpen] = useState(false);
  const [startHour, setStartHour] = useState(
    parseInt(config.timeSlots[0]?.startTime?.split(':')[0] || '9')
  );
  const [endHour, setEndHour] = useState(
    parseInt(config.timeSlots[config.timeSlots.length - 1]?.endTime?.split(':')[0] || '17')
  );
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(config.days);

  const handlePresetSelect = (presetKey: PresetConfigKey) => {
    const preset = PRESET_CONFIGS[presetKey];
    setSelectedDays(preset.days);
    setStartHour(parseInt(preset.timeSlots[0].startTime.split(':')[0]));
    setEndHour(parseInt(preset.timeSlots[preset.timeSlots.length - 1].endTime.split(':')[0]));
    
    onConfigChange({
      ...config,
      name: preset.name,
      days: preset.days,
      timeSlots: preset.timeSlots
    });
  };

  const handleDayToggle = (day: DayOfWeek, checked: boolean) => {
    const newDays = checked 
      ? [...selectedDays, day].sort((a, b) => ALL_DAYS.indexOf(a) - ALL_DAYS.indexOf(b))
      : selectedDays.filter(d => d !== day);
    
    setSelectedDays(newDays);
    onConfigChange({
      ...config,
      days: newDays
    });
  };

  const handleTimeChange = () => {
    const newTimeSlots = generateTimeSlots(startHour, endHour, 60);
    onConfigChange({
      ...config,
      timeSlots: newTimeSlots
    });
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          Configure
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Timetable Configuration
          </SheetTitle>
          <SheetDescription>
            Customize days, time slots, and presets for your timetable view.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          {/* Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Quick Presets</Label>
            <Select onValueChange={(value) => handlePresetSelect(value as PresetConfigKey)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a preset..." />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRESET_CONFIGS).map(([key, preset]) => (
                  <SelectItem key={key} value={key}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Days
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_DAYS.map(day => (
                <div key={day} className="flex items-center space-x-2">
                  <Checkbox
                    id={day}
                    checked={selectedDays.includes(day)}
                    onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                  />
                  <Label htmlFor={day} className="text-sm cursor-pointer">
                    {day}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Time Range */}
          <div className="space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Time Range
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <Select 
                  value={startHour.toString()} 
                  onValueChange={(value) => setStartHour(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.filter(h => h < endHour).map(hour => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">End Time</Label>
                <Select 
                  value={endHour.toString()} 
                  onValueChange={(value) => setEndHour(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {hours.filter(h => h > startHour).map(hour => (
                      <SelectItem key={hour} value={hour.toString()}>
                        {hour.toString().padStart(2, '0')}:00
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full mt-2"
              onClick={handleTimeChange}
            >
              Apply Time Range
            </Button>
          </div>

          {/* Current Config Summary */}
          <div className="p-4 rounded-lg bg-secondary/50 space-y-2">
            <p className="text-sm font-medium">Current Configuration</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Days: {config.days.length} ({config.days.map(d => d.slice(0, 3)).join(', ')})</p>
              <p>Time Slots: {config.timeSlots.length} slots</p>
              <p>
                Hours: {config.timeSlots[0]?.startTime || 'N/A'} - {config.timeSlots[config.timeSlots.length - 1]?.endTime || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
