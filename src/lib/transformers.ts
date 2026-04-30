import type { Room, Faculty, SupportStaff, Asset, Course, Batch, ScheduleSlot, Alert, DashboardStats } from '@/types';
import type { Tables } from '@/integrations/supabase/types';

// Room transformers
export const transformRoom = (dbRoom: Tables<'rooms'>): Room => ({
  id: dbRoom.id,
  name: dbRoom.name,
  type: dbRoom.type,
  capacity: dbRoom.capacity,
  building: dbRoom.building,
  floor: dbRoom.floor,
  hasProjector: dbRoom.has_projector ?? false,
  hasSmartBoard: dbRoom.has_smart_board ?? false,
  hasAC: dbRoom.has_ac ?? false,
  status: dbRoom.status,
});

// Faculty transformers
type DbFacultyStatus = 'available' | 'on_leave' | 'busy';
type FrontendFacultyStatus = 'available' | 'on-leave' | 'busy';

const transformFacultyStatus = (status: DbFacultyStatus): FrontendFacultyStatus => {
  if (status === 'on_leave') return 'on-leave';
  return status;
};

export const transformFaculty = (dbFaculty: Tables<'faculty'>): Faculty => ({
  id: dbFaculty.id,
  name: dbFaculty.name,
  email: dbFaculty.email,
  department: dbFaculty.department,
  subjects: dbFaculty.subjects ?? [],
  maxLoad: dbFaculty.max_load,
  currentLoad: dbFaculty.current_load,
  status: transformFacultyStatus(dbFaculty.status as DbFacultyStatus),
});

// Staff transformers
type DbStaffRole = 'lab_assistant' | 'technician' | 'admin_staff';
type FrontendStaffRole = 'lab-assistant' | 'technician' | 'admin';

type DbStaffShift = 'morning' | 'afternoon' | 'full_day';
type FrontendStaffShift = 'morning' | 'afternoon' | 'full-day';

type DbStaffStatus = 'available' | 'assigned' | 'on_leave';
type FrontendStaffStatus = 'available' | 'assigned' | 'on-leave';

const transformStaffRole = (role: DbStaffRole): FrontendStaffRole => {
  const map: Record<DbStaffRole, FrontendStaffRole> = {
    'lab_assistant': 'lab-assistant',
    'technician': 'technician',
    'admin_staff': 'admin',
  };
  return map[role];
};

const transformStaffShift = (shift: DbStaffShift): FrontendStaffShift => {
  if (shift === 'full_day') return 'full-day';
  return shift;
};

const transformStaffStatus = (status: DbStaffStatus): FrontendStaffStatus => {
  if (status === 'on_leave') return 'on-leave';
  return status;
};

export const transformStaff = (dbStaff: Tables<'support_staff'>): SupportStaff => ({
  id: dbStaff.id,
  name: dbStaff.name,
  email: dbStaff.email ?? undefined,
  role: transformStaffRole(dbStaff.role as DbStaffRole),
  department: dbStaff.department,
  shift: transformStaffShift(dbStaff.shift as DbStaffShift),
  status: transformStaffStatus(dbStaff.status as DbStaffStatus),
});

// Asset transformers
export const transformAsset = (dbAsset: Tables<'assets'>): Asset => ({
  id: dbAsset.id,
  name: dbAsset.name,
  type: dbAsset.type,
  location: dbAsset.location ?? '',
  status: dbAsset.status,
  assignedTo: dbAsset.assigned_to ?? undefined,
});

// Course transformers
export const transformCourse = (dbCourse: Tables<'courses'>): Course => ({
  id: dbCourse.id,
  code: dbCourse.code,
  name: dbCourse.name,
  department: dbCourse.department,
  weeklyHours: dbCourse.weekly_hours,
  requiresLab: dbCourse.requires_lab ?? false,
  requiresProjector: dbCourse.requires_projector ?? false,
  creditHours: dbCourse.credit_hours,
});

// Batch transformers
export const transformBatch = (dbBatch: Tables<'batches'>): Batch => ({
  id: dbBatch.id,
  name: dbBatch.name,
  discipline: (dbBatch as any).discipline ?? 'B.Tech',
  branch: (dbBatch as any).branch ?? dbBatch.stream,
  subBranch: (dbBatch as any).sub_branch ?? undefined,
  section: (dbBatch as any).section ?? 'A',
  semester: dbBatch.semester,
  size: dbBatch.size,
  year: dbBatch.year,
  classStartTime: (dbBatch as any).class_start_time?.slice(0, 5) ?? undefined,
  classEndTime: (dbBatch as any).class_end_time?.slice(0, 5) ?? undefined,
});

// Alert transformers
export const transformAlert = (dbAlert: Tables<'alerts'>): Alert => ({
  id: dbAlert.id,
  type: dbAlert.type,
  title: dbAlert.title,
  message: dbAlert.message,
  timestamp: new Date(dbAlert.created_at),
  resolved: dbAlert.resolved ?? false,
});

// Schedule transformer (requires joined data)
export interface DbScheduleWithRelations {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  type: 'lecture' | 'lab' | 'tutorial';
  courses: { id: string; name: string } | null;
  faculty: { id: string; name: string } | null;
  batches: { id: string; name: string } | null;
  rooms: { id: string; name: string } | null;
  support_staff: { id: string; name: string } | null;
  schedule_warnings: { warning: string; resolved: boolean }[];
}

type ScheduleDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';

export const transformSchedule = (dbSchedule: DbScheduleWithRelations): ScheduleSlot => {
  const unresolvedWarnings = dbSchedule.schedule_warnings
    ?.filter(w => !w.resolved)
    .map(w => w.warning) ?? [];

  return {
    id: dbSchedule.id,
    courseId: dbSchedule.courses?.id ?? '',
    courseName: dbSchedule.courses?.name ?? 'Unknown Course',
    teacherId: dbSchedule.faculty?.id ?? '',
    teacherName: dbSchedule.faculty?.name ?? 'Unknown Teacher',
    batchId: dbSchedule.batches?.id ?? '',
    batchName: dbSchedule.batches?.name ?? 'Unknown Batch',
    roomId: dbSchedule.rooms?.id ?? '',
    roomName: dbSchedule.rooms?.name ?? 'Unknown Room',
    day: dbSchedule.day as ScheduleDay,
    startTime: dbSchedule.start_time.slice(0, 5), // Format: HH:MM
    endTime: dbSchedule.end_time.slice(0, 5),
    type: dbSchedule.type,
    assignedStaff: dbSchedule.support_staff?.name,
    warnings: unresolvedWarnings.length > 0 ? unresolvedWarnings : undefined,
  };
};
