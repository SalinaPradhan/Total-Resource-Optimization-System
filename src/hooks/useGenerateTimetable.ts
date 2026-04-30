import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Weights {
  hardClash: number;
  roomConstraint: number;
  staffAvailability: number;
  infrastructure: number;
  facultyUnavailable: number;
  facultyPreferred: number;
}

interface AlgorithmParams {
  populationSize: number;
  maxGenerations: number;
  mutationRate: number;
  crossoverRate: number;
  eliteCount: number;
}

interface GenerateOptions {
  weights: Weights;
  params: AlgorithmParams;
  academicYear: string;
  semester: number;
  clearExisting: boolean;
}

interface GenerateResult {
  success: boolean;
  message: string;
  stats?: {
    totalEntries: number;
    conflicts: number;
    availabilityViolations: number;
    fitness: number;
    generations: number;
  };
  error?: string;
}

export const useGenerateTimetable = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (options: GenerateOptions): Promise<GenerateResult> => {
      const { data, error } = await supabase.functions.invoke('generate-timetable', {
        body: options,
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate timetable');
      }

      return data as GenerateResult;
    },
    onSuccess: () => {
      // Invalidate schedules queries to refresh the timetable view
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
  });
};
