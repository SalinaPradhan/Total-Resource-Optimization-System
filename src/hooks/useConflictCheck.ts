import { useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

export interface ConflictCheckInput {
  roomId: string;
  facultyId: string;
  batchId: string;
  day: string;
  startTime: string;
  endTime: string;
  excludeScheduleId?: string; // For updates, exclude the current schedule
}

export interface Conflict {
  type: 'room' | 'faculty' | 'batch';
  message: string;
  conflictingScheduleId: string;
  details: {
    name: string;
    time: string;
    course: string;
  };
}

export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: Conflict[];
}

// Helper to check if two time ranges overlap
function timesOverlap(
  start1: string,
  end1: string,
  start2: string,
  end2: string
): boolean {
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + (m || 0);
  };
  
  const s1 = toMinutes(start1);
  const e1 = toMinutes(end1);
  const s2 = toMinutes(start2);
  const e2 = toMinutes(end2);
  
  return s1 < e2 && s2 < e1;
}

export function useConflictCheck(input: ConflictCheckInput | null) {
  return useQuery({
    queryKey: ['conflict-check', input],
    queryFn: async (): Promise<ConflictCheckResult> => {
      if (!input) return { hasConflicts: false, conflicts: [] };

      const { roomId, facultyId, batchId, day, startTime, endTime, excludeScheduleId } = input;
      const conflicts: Conflict[] = [];

      // Fetch all schedules for the same day
      let query = supabase
        .from('schedules')
        .select(`
          id,
          day,
          start_time,
          end_time,
          room_id,
          faculty_id,
          batch_id,
          courses:course_id (name),
          rooms:room_id (name),
          faculty:faculty_id (name),
          batches:batch_id (name)
        `)
        .eq('day', day);

      if (excludeScheduleId) {
        query = query.neq('id', excludeScheduleId);
      }

      const { data: schedules, error } = await query;

      if (error) throw error;

      for (const schedule of schedules || []) {
        const overlaps = timesOverlap(
          startTime,
          endTime,
          schedule.start_time,
          schedule.end_time
        );

        if (!overlaps) continue;

        const courseName = (schedule.courses as any)?.name || 'Unknown Course';
        const timeRange = `${schedule.start_time} - ${schedule.end_time}`;

        // Check room conflict
        if (schedule.room_id === roomId) {
          conflicts.push({
            type: 'room',
            message: `Room is already booked`,
            conflictingScheduleId: schedule.id,
            details: {
              name: (schedule.rooms as any)?.name || 'Unknown Room',
              time: timeRange,
              course: courseName,
            },
          });
        }

        // Check faculty conflict
        if (schedule.faculty_id === facultyId) {
          conflicts.push({
            type: 'faculty',
            message: `Faculty is already scheduled`,
            conflictingScheduleId: schedule.id,
            details: {
              name: (schedule.faculty as any)?.name || 'Unknown Faculty',
              time: timeRange,
              course: courseName,
            },
          });
        }

        // Check batch conflict
        if (schedule.batch_id === batchId) {
          conflicts.push({
            type: 'batch',
            message: `Batch already has a class`,
            conflictingScheduleId: schedule.id,
            details: {
              name: (schedule.batches as any)?.name || 'Unknown Batch',
              time: timeRange,
              course: courseName,
            },
          });
        }
      }

      return {
        hasConflicts: conflicts.length > 0,
        conflicts,
      };
    },
    enabled: !!input && !!input.roomId && !!input.facultyId && !!input.batchId && !!input.day && !!input.startTime && !!input.endTime,
    staleTime: 5000, // Cache for 5 seconds
  });
}

// Non-hook version for use in mutations
export async function checkConflicts(input: ConflictCheckInput): Promise<ConflictCheckResult> {
  const { roomId, facultyId, batchId, day, startTime, endTime, excludeScheduleId } = input;
  const conflicts: Conflict[] = [];

  let query = supabase
    .from('schedules')
    .select(`
      id,
      day,
      start_time,
      end_time,
      room_id,
      faculty_id,
      batch_id,
      courses:course_id (name),
      rooms:room_id (name),
      faculty:faculty_id (name),
      batches:batch_id (name)
    `)
    .eq('day', day);

  if (excludeScheduleId) {
    query = query.neq('id', excludeScheduleId);
  }

  const { data: schedules, error } = await query;

  if (error) throw error;

  for (const schedule of schedules || []) {
    const overlaps = timesOverlap(
      startTime,
      endTime,
      schedule.start_time,
      schedule.end_time
    );

    if (!overlaps) continue;

    const courseName = (schedule.courses as any)?.name || 'Unknown Course';
    const timeRange = `${schedule.start_time} - ${schedule.end_time}`;

    if (schedule.room_id === roomId) {
      conflicts.push({
        type: 'room',
        message: `Room is already booked`,
        conflictingScheduleId: schedule.id,
        details: {
          name: (schedule.rooms as any)?.name || 'Unknown Room',
          time: timeRange,
          course: courseName,
        },
      });
    }

    if (schedule.faculty_id === facultyId) {
      conflicts.push({
        type: 'faculty',
        message: `Faculty is already scheduled`,
        conflictingScheduleId: schedule.id,
        details: {
          name: (schedule.faculty as any)?.name || 'Unknown Faculty',
          time: timeRange,
          course: courseName,
        },
      });
    }

    if (schedule.batch_id === batchId) {
      conflicts.push({
        type: 'batch',
        message: `Batch already has a class`,
        conflictingScheduleId: schedule.id,
        details: {
          name: (schedule.batches as any)?.name || 'Unknown Batch',
          time: timeRange,
          course: courseName,
        },
      });
    }
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
  };
}
