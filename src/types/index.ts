export interface Room {
  id: string;
  name: string;
  type: 'lecture' | 'lab' | 'seminar' | 'auditorium';
  capacity: number;
  building: string;
  floor: number;
  hasProjector: boolean;
  hasSmartBoard: boolean;
  hasAC: boolean;
  status: 'available' | 'occupied' | 'maintenance';
}

export interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  subjects: string[];
  maxLoad: number;
  currentLoad: number;
  status: 'available' | 'on-leave' | 'busy';
}

export interface SupportStaff {
  id: string;
  name: string;
  email?: string;
  role: 'lab-assistant' | 'technician' | 'admin';
  department: string;
  shift: 'morning' | 'afternoon' | 'full-day';
  status: 'available' | 'assigned' | 'on-leave';
}

export interface Asset {
  id: string;
  name: string;
  type: 'projector' | 'computer' | 'equipment' | 'furniture';
  location: string;
  status: 'working' | 'broken' | 'maintenance';
  assignedTo?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  weeklyHours: number;
  requiresLab: boolean;
  requiresProjector: boolean;
  creditHours: number;
}

export interface Batch {
  id: string;
  name: string;
  discipline: string;
  branch: string;
  subBranch?: string;
  section: string;
  semester: number;
  size: number;
  year: number;
  classStartTime?: string;
  classEndTime?: string;
}

export interface ScheduleSlot {
  id: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  batchId: string;
  batchName: string;
  roomId: string;
  roomName: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  type: 'lecture' | 'lab' | 'tutorial';
  assignedStaff?: string;
  warnings?: string[];
}

export interface Alert {
  id: string;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export interface DashboardStats {
  totalRooms: number;
  availableRooms: number;
  totalFaculty: number;
  activeFaculty: number;
  totalStaff: number;
  assignedStaff: number;
  totalAssets: number;
  workingAssets: number;
  scheduledClasses: number;
  conflicts: number;
}
