import { z } from "zod";

// Shared validation constants
const MAX_TEXT_LENGTH = 100;
const MAX_LONG_TEXT_LENGTH = 200;
const MAX_EMAIL_LENGTH = 255;
const MAX_CODE_LENGTH = 20;

// Room validation schema
export const roomSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(MAX_TEXT_LENGTH, `Name must be less than ${MAX_TEXT_LENGTH} characters`),
  type: z.enum(["lecture", "lab", "seminar", "auditorium"], {
    required_error: "Room type is required",
  }),
  capacity: z.coerce
    .number()
    .min(1, "Capacity must be at least 1")
    .max(1000, "Capacity cannot exceed 1000"),
  building: z
    .string()
    .trim()
    .min(1, "Building is required")
    .max(MAX_TEXT_LENGTH, `Building must be less than ${MAX_TEXT_LENGTH} characters`),
  floor: z.coerce
    .number()
    .min(0, "Floor must be 0 or higher")
    .max(50, "Floor cannot exceed 50"),
  hasProjector: z.boolean(),
  hasSmartBoard: z.boolean(),
  hasAC: z.boolean(),
  status: z.enum(["available", "occupied", "maintenance"], {
    required_error: "Status is required",
  }),
});

export type RoomFormValues = z.infer<typeof roomSchema>;

// Faculty validation schema
export const facultySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(MAX_TEXT_LENGTH, `Name must be less than ${MAX_TEXT_LENGTH} characters`),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("Invalid email address")
    .max(MAX_EMAIL_LENGTH, `Email must be less than ${MAX_EMAIL_LENGTH} characters`),
  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(MAX_TEXT_LENGTH, `Department must be less than ${MAX_TEXT_LENGTH} characters`),
  subjects: z
    .string()
    .trim()
    .min(1, "At least one subject is required")
    .max(500, "Subjects list is too long"),
  maxLoad: z.coerce
    .number()
    .min(1, "Max load must be at least 1")
    .max(40, "Max load cannot exceed 40"),
  currentLoad: z.coerce
    .number()
    .min(0, "Current load cannot be negative")
    .max(40, "Current load cannot exceed 40"),
  status: z.enum(["available", "on-leave", "busy"], {
    required_error: "Status is required",
  }),
});

export type FacultyFormValues = z.infer<typeof facultySchema>;

// Staff validation schema
export const staffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(MAX_TEXT_LENGTH, `Name must be less than ${MAX_TEXT_LENGTH} characters`),
  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(MAX_EMAIL_LENGTH, `Email must be less than ${MAX_EMAIL_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(MAX_TEXT_LENGTH, `Department must be less than ${MAX_TEXT_LENGTH} characters`),
  role: z.enum(["lab-assistant", "technician", "admin"], {
    required_error: "Role is required",
  }),
  shift: z.enum(["morning", "afternoon", "full-day"], {
    required_error: "Shift is required",
  }),
  status: z.enum(["available", "assigned", "on-leave"], {
    required_error: "Status is required",
  }),
});

export type StaffFormValues = z.infer<typeof staffSchema>;

// Course validation schema
export const courseSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Course code is required")
    .max(MAX_CODE_LENGTH, `Course code must be less than ${MAX_CODE_LENGTH} characters`)
    .regex(/^[A-Za-z0-9-]+$/, "Course code can only contain letters, numbers, and hyphens"),
  name: z
    .string()
    .trim()
    .min(1, "Course name is required")
    .max(MAX_LONG_TEXT_LENGTH, `Course name must be less than ${MAX_LONG_TEXT_LENGTH} characters`),
  department: z
    .string()
    .trim()
    .min(1, "Department is required")
    .max(MAX_TEXT_LENGTH, `Department must be less than ${MAX_TEXT_LENGTH} characters`),
  weeklyHours: z.coerce
    .number()
    .min(1, "Weekly hours must be at least 1")
    .max(20, "Weekly hours cannot exceed 20"),
  creditHours: z.coerce
    .number()
    .min(1, "Credit hours must be at least 1")
    .max(10, "Credit hours cannot exceed 10"),
  requiresLab: z.boolean(),
  requiresProjector: z.boolean(),
});

export type CourseFormValues = z.infer<typeof courseSchema>;

// Batch validation schema
const currentYear = new Date().getFullYear();

export const DISCIPLINES = ['BCA', 'MCA', 'B.Tech', 'M.Tech', 'MBA'] as const;

export const batchSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Batch name is required")
    .max(MAX_TEXT_LENGTH, `Batch name must be less than ${MAX_TEXT_LENGTH} characters`),
  discipline: z.enum(DISCIPLINES, { required_error: "Discipline is required" }),
  branch: z
    .string()
    .trim()
    .min(1, "Branch is required")
    .max(MAX_TEXT_LENGTH, `Branch must be less than ${MAX_TEXT_LENGTH} characters`),
  subBranch: z
    .string()
    .trim()
    .max(MAX_TEXT_LENGTH, `Sub-branch must be less than ${MAX_TEXT_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  section: z
    .string()
    .trim()
    .min(1, "Section is required")
    .max(10, "Section must be less than 10 characters"),
  semester: z.coerce
    .number()
    .min(1, "Semester must be between 1 and 8")
    .max(8, "Semester must be between 1 and 8"),
  size: z.coerce
    .number()
    .min(1, "Size must be at least 1")
    .max(500, "Size cannot exceed 500"),
  year: z.coerce
    .number()
    .min(2000, "Year must be 2000 or later")
    .max(currentYear + 5, `Year cannot exceed ${currentYear + 5}`),
  classStartTime: z.string().optional().or(z.literal("")),
  classEndTime: z.string().optional().or(z.literal("")),
});

export type BatchFormValues = z.infer<typeof batchSchema>;

// Asset validation schema
export const assetSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Asset name is required")
    .max(MAX_TEXT_LENGTH, `Name must be less than ${MAX_TEXT_LENGTH} characters`),
  type: z.enum(["projector", "computer", "equipment", "furniture"], {
    required_error: "Asset type is required",
  }),
  location: z
    .string()
    .trim()
    .max(MAX_LONG_TEXT_LENGTH, `Location must be less than ${MAX_LONG_TEXT_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
  status: z.enum(["working", "broken", "maintenance"], {
    required_error: "Status is required",
  }),
  assignedTo: z
    .string()
    .trim()
    .max(MAX_TEXT_LENGTH, `Assigned to must be less than ${MAX_TEXT_LENGTH} characters`)
    .optional()
    .or(z.literal("")),
});

export type AssetFormValues = z.infer<typeof assetSchema>;

// Helper function to parse subjects string into array
export const parseSubjects = (subjects: string): string[] => {
  return subjects
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
};

// Helper function to format subjects array into string
export const formatSubjects = (subjects: string[]): string => {
  return subjects.join(", ");
};
