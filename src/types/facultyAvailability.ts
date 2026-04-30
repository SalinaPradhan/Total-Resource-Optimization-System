export type DayOfWeek = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
export type PreferenceType = 'preferred' | 'available' | 'unavailable';

export interface FacultyAvailability {
  id: string;
  facultyId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  preferenceType: PreferenceType;
}

export interface FacultyAvailabilityInput {
  facultyId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  preferenceType: PreferenceType;
}
