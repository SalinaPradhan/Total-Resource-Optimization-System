import { Room, Faculty, SupportStaff, Asset, Course, Batch, ScheduleSlot, Alert, DashboardStats } from '@/types';

export const mockRooms: Room[] = [
  { id: 'R101', name: 'Room 101', type: 'lecture', capacity: 60, building: 'Main Block', floor: 1, hasProjector: true, hasSmartBoard: true, hasAC: true, status: 'available' },
  { id: 'R102', name: 'Room 102', type: 'lecture', capacity: 45, building: 'Main Block', floor: 1, hasProjector: true, hasSmartBoard: false, hasAC: true, status: 'occupied' },
  { id: 'LAB01', name: 'Computer Lab 1', type: 'lab', capacity: 40, building: 'Science Block', floor: 2, hasProjector: true, hasSmartBoard: true, hasAC: true, status: 'available' },
  { id: 'LAB02', name: 'Chemistry Lab', type: 'lab', capacity: 35, building: 'Science Block', floor: 2, hasProjector: false, hasSmartBoard: false, hasAC: true, status: 'maintenance' },
  { id: 'SEM01', name: 'Seminar Hall A', type: 'seminar', capacity: 100, building: 'Main Block', floor: 3, hasProjector: true, hasSmartBoard: true, hasAC: true, status: 'available' },
  { id: 'AUD01', name: 'Main Auditorium', type: 'auditorium', capacity: 500, building: 'Central Block', floor: 0, hasProjector: true, hasSmartBoard: true, hasAC: true, status: 'available' },
];

export const mockFaculty: Faculty[] = [
  { id: 'F001', name: 'Dr. Sarah Johnson', email: 'sarah.j@university.edu', department: 'Computer Science', subjects: ['Data Structures', 'Algorithms'], maxLoad: 18, currentLoad: 15, status: 'available' },
  { id: 'F002', name: 'Prof. Michael Chen', email: 'michael.c@university.edu', department: 'Computer Science', subjects: ['Database Systems', 'Web Development'], maxLoad: 16, currentLoad: 16, status: 'busy' },
  { id: 'F003', name: 'Dr. Emily Williams', email: 'emily.w@university.edu', department: 'Electronics', subjects: ['Digital Electronics', 'Signal Processing'], maxLoad: 18, currentLoad: 12, status: 'available' },
  { id: 'F004', name: 'Prof. James Smith', email: 'james.s@university.edu', department: 'Mathematics', subjects: ['Calculus', 'Linear Algebra'], maxLoad: 20, currentLoad: 18, status: 'available' },
  { id: 'F005', name: 'Dr. Lisa Anderson', email: 'lisa.a@university.edu', department: 'Physics', subjects: ['Mechanics', 'Thermodynamics'], maxLoad: 16, currentLoad: 8, status: 'on-leave' },
];

export const mockStaff: SupportStaff[] = [
  { id: 'S001', name: 'John Martinez', role: 'lab-assistant', department: 'Computer Science', shift: 'full-day', status: 'available' },
  { id: 'S002', name: 'Maria Garcia', role: 'lab-assistant', department: 'Chemistry', shift: 'morning', status: 'assigned' },
  { id: 'S003', name: 'David Lee', role: 'technician', department: 'IT Services', shift: 'full-day', status: 'available' },
  { id: 'S004', name: 'Anna Wilson', role: 'admin', department: 'Administration', shift: 'full-day', status: 'available' },
];

export const mockAssets: Asset[] = [
  { id: 'A001', name: 'Projector 1', type: 'projector', location: 'R101', status: 'working' },
  { id: 'A002', name: 'Projector 2', type: 'projector', location: 'R102', status: 'working' },
  { id: 'A003', name: 'Projector 3', type: 'projector', location: 'Storage', status: 'broken' },
  { id: 'A004', name: 'Lab Computer Set A', type: 'computer', location: 'LAB01', status: 'working' },
  { id: 'A005', name: 'Lab Computer Set B', type: 'computer', location: 'LAB01', status: 'maintenance' },
  { id: 'A006', name: 'Chemistry Equipment Kit', type: 'equipment', location: 'LAB02', status: 'working' },
];

export const mockCourses: Course[] = [
  { id: 'CS101', code: 'CS101', name: 'Introduction to Programming', department: 'Computer Science', weeklyHours: 4, requiresLab: true, requiresProjector: true, creditHours: 4 },
  { id: 'CS201', code: 'CS201', name: 'Data Structures', department: 'Computer Science', weeklyHours: 3, requiresLab: true, requiresProjector: true, creditHours: 3 },
  { id: 'CS301', code: 'CS301', name: 'Database Systems', department: 'Computer Science', weeklyHours: 3, requiresLab: true, requiresProjector: true, creditHours: 3 },
  { id: 'MA101', code: 'MA101', name: 'Calculus I', department: 'Mathematics', weeklyHours: 4, requiresLab: false, requiresProjector: false, creditHours: 4 },
  { id: 'PH101', code: 'PH101', name: 'Physics I', department: 'Physics', weeklyHours: 3, requiresLab: true, requiresProjector: true, creditHours: 3 },
];

export const mockBatches: Batch[] = [
  { id: 'B001', name: 'CS-2024-A', discipline: 'B.Tech', branch: 'Computer Science', section: 'A', size: 55, semester: 3, year: 2024 },
  { id: 'B002', name: 'CS-2024-B', discipline: 'B.Tech', branch: 'Computer Science', section: 'B', size: 52, semester: 3, year: 2024 },
  { id: 'B003', name: 'EC-2024-A', discipline: 'B.Tech', branch: 'Electronics', section: 'A', size: 48, semester: 5, year: 2024 },
  { id: 'B004', name: 'ME-2024-A', discipline: 'B.Tech', branch: 'Mechanical', section: 'A', size: 60, semester: 1, year: 2024 },
];

export const mockSchedule: ScheduleSlot[] = [
  { id: 'SCH001', courseId: 'CS101', courseName: 'Intro to Programming', teacherId: 'F001', teacherName: 'Dr. Sarah Johnson', batchId: 'B001', batchName: 'CS - Sem 3 - Sec A', roomId: 'R101', roomName: 'Room 101', day: 'Monday', startTime: '09:00', endTime: '10:00', type: 'lecture' },
  { id: 'SCH002', courseId: 'CS101', courseName: 'Intro to Programming', teacherId: 'F001', teacherName: 'Dr. Sarah Johnson', batchId: 'B001', batchName: 'CS - Sem 3 - Sec A', roomId: 'LAB01', roomName: 'Computer Lab 1', day: 'Monday', startTime: '10:00', endTime: '12:00', type: 'lab', assignedStaff: 'John Martinez' },
  { id: 'SCH003', courseId: 'CS201', courseName: 'Data Structures', teacherId: 'F001', teacherName: 'Dr. Sarah Johnson', batchId: 'B002', batchName: 'CS - Sem 3 - Sec B', roomId: 'R102', roomName: 'Room 102', day: 'Monday', startTime: '14:00', endTime: '15:00', type: 'lecture' },
  { id: 'SCH004', courseId: 'MA101', courseName: 'Calculus I', teacherId: 'F004', teacherName: 'Prof. James Smith', batchId: 'B001', batchName: 'CS - Sem 3 - Sec A', roomId: 'R101', roomName: 'Room 101', day: 'Tuesday', startTime: '09:00', endTime: '10:00', type: 'lecture' },
  { id: 'SCH005', courseId: 'CS301', courseName: 'Database Systems', teacherId: 'F002', teacherName: 'Prof. Michael Chen', batchId: 'B002', batchName: 'CS - Sem 3 - Sec B', roomId: 'LAB01', roomName: 'Computer Lab 1', day: 'Tuesday', startTime: '10:00', endTime: '12:00', type: 'lab', assignedStaff: 'John Martinez' },
  { id: 'SCH006', courseId: 'PH101', courseName: 'Physics I', teacherId: 'F005', teacherName: 'Dr. Lisa Anderson', batchId: 'B004', batchName: 'ME - Sem 1 - Sec A', roomId: 'SEM01', roomName: 'Seminar Hall A', day: 'Wednesday', startTime: '11:00', endTime: '12:00', type: 'lecture', warnings: ['Faculty on leave - substitute required'] },
  { id: 'SCH007', courseId: 'CS201', courseName: 'Data Structures', teacherId: 'F001', teacherName: 'Dr. Sarah Johnson', batchId: 'B001', batchName: 'CS - Sem 3 - Sec A', roomId: 'R101', roomName: 'Room 101', day: 'Wednesday', startTime: '14:00', endTime: '15:00', type: 'lecture' },
  { id: 'SCH008', courseId: 'CS101', courseName: 'Intro to Programming', teacherId: 'F001', teacherName: 'Dr. Sarah Johnson', batchId: 'B002', batchName: 'CS - Sem 3 - Sec B', roomId: 'LAB01', roomName: 'Computer Lab 1', day: 'Thursday', startTime: '09:00', endTime: '11:00', type: 'lab', assignedStaff: 'John Martinez' },
  { id: 'SCH009', courseId: 'MA101', courseName: 'Calculus I', teacherId: 'F004', teacherName: 'Prof. James Smith', batchId: 'B002', batchName: 'CS - Sem 3 - Sec B', roomId: 'R102', roomName: 'Room 102', day: 'Thursday', startTime: '14:00', endTime: '15:00', type: 'lecture' },
  { id: 'SCH010', courseId: 'CS301', courseName: 'Database Systems', teacherId: 'F002', teacherName: 'Prof. Michael Chen', batchId: 'B001', batchName: 'CS - Sem 3 - Sec A', roomId: 'R101', roomName: 'Room 101', day: 'Friday', startTime: '09:00', endTime: '10:00', type: 'lecture' },
];

export const mockAlerts: Alert[] = [
  { id: 'AL001', type: 'error', title: 'Resource Conflict', message: 'Chemistry Lab under maintenance - 2 classes affected', timestamp: new Date(), resolved: false },
  { id: 'AL002', type: 'warning', title: 'Faculty Overload', message: 'Prof. Michael Chen has reached maximum teaching load', timestamp: new Date(), resolved: false },
  { id: 'AL003', type: 'warning', title: 'Equipment Issue', message: 'Projector 3 marked as broken - needs replacement', timestamp: new Date(), resolved: false },
  { id: 'AL004', type: 'info', title: 'Schedule Generated', message: 'Weekly timetable successfully generated with 0 conflicts', timestamp: new Date(), resolved: true },
  { id: 'AL005', type: 'warning', title: 'Staff Shortage', message: 'Only 1 lab assistant available for Tuesday morning slot', timestamp: new Date(), resolved: false },
];

export const mockStats: DashboardStats = {
  totalRooms: 6,
  availableRooms: 4,
  totalFaculty: 5,
  activeFaculty: 4,
  totalStaff: 4,
  assignedStaff: 1,
  totalAssets: 6,
  workingAssets: 4,
  scheduledClasses: 10,
  conflicts: 2,
};
