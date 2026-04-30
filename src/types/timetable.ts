// Timetable configuration and types

export interface TimeSlotConfig {
  startTime: string; // 24-hour format: "06:00"
  endTime: string;   // 24-hour format: "07:00"
  label?: string;    // Optional custom label
}

export interface TimetableConfig {
  id?: string;
  name: string;
  days: DayOfWeek[];
  timeSlots: TimeSlotConfig[];
  batchId?: string;
  departmentId?: string;
}

export type DayOfWeek = 
  | 'Monday' 
  | 'Tuesday' 
  | 'Wednesday' 
  | 'Thursday' 
  | 'Friday' 
  | 'Saturday' 
  | 'Sunday';

export const ALL_DAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export const WEEKDAYS: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday'
];

export const WEEKDAYS_WITH_SATURDAY: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

export interface TimetableCell {
  day: DayOfWeek;
  timeSlot: TimeSlotConfig;
  slot?: TimetableSlotData;
  isEmpty: boolean;
}

export interface TimetableSlotData {
  id: string;
  subjectName: string;
  subjectCode?: string;
  facultyName: string;
  facultyId: string;
  batchName: string;
  batchId: string;
  departmentName?: string;
  roomName: string;
  roomId: string;
  type: 'lecture' | 'lab' | 'tutorial';
  duration: number; // in hours
  warnings?: string[];
}

// Helper function to generate time slots
export function generateTimeSlots(
  startHour: number,
  endHour: number,
  intervalMinutes: number = 60
): TimeSlotConfig[] {
  const slots: TimeSlotConfig[] = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let min = 0; min < 60; min += intervalMinutes) {
      const start = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
      
      let endMin = min + intervalMinutes;
      let endHr = hour;
      if (endMin >= 60) {
        endMin -= 60;
        endHr += 1;
      }
      
      if (endHr > endHour || (endHr === endHour && endMin > 0)) break;
      
      const end = `${endHr.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
      
      slots.push({
        startTime: start,
        endTime: end,
        label: `${start} - ${end}`
      });
    }
  }
  
  return slots;
}

// Preset configurations for common scenarios
export const PRESET_CONFIGS = {
  standard: {
    name: 'Standard (9 AM - 5 PM)',
    days: WEEKDAYS_WITH_SATURDAY,
    timeSlots: generateTimeSlots(9, 17, 60)
  },
  extended: {
    name: 'Extended (8 AM - 8 PM)',
    days: WEEKDAYS_WITH_SATURDAY,
    timeSlots: generateTimeSlots(8, 20, 60)
  },
  fullDay: {
    name: 'Full Day (6 AM - 10 PM)',
    days: ALL_DAYS,
    timeSlots: generateTimeSlots(6, 22, 60)
  },
  morning: {
    name: 'Morning Shift (6 AM - 12 PM)',
    days: WEEKDAYS,
    timeSlots: generateTimeSlots(6, 12, 60)
  },
  afternoon: {
    name: 'Afternoon Shift (12 PM - 6 PM)',
    days: WEEKDAYS,
    timeSlots: generateTimeSlots(12, 18, 60)
  },
  evening: {
    name: 'Evening Shift (4 PM - 10 PM)',
    days: WEEKDAYS_WITH_SATURDAY,
    timeSlots: generateTimeSlots(16, 22, 60)
  }
} as const;

export type PresetConfigKey = keyof typeof PRESET_CONFIGS;
