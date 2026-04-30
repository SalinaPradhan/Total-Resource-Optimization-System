import { supabase } from '@/integrations/supabase/client';

type ResourceType = 'rooms' | 'faculty' | 'staff' | 'courses' | 'batches';
type ActionType = 'create' | 'update';

interface ValidationResponse<T> {
  data?: T;
  error?: string;
  details?: { field: string; message: string }[];
}

export async function validateAndInsert<T>(
  resource: ResourceType,
  action: ActionType,
  data: Record<string, unknown>,
  id?: string
): Promise<ValidationResponse<T>> {
  try {
    const { data: result, error } = await supabase.functions.invoke('validate-and-insert', {
      body: { resource, action, data, id },
    });

    if (error) {
      console.error('Edge function error:', error);
      return { error: error.message };
    }

    if (result.error) {
      return { 
        error: result.error, 
        details: result.details 
      };
    }

    return { data: result.data as T };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Validation request failed:', errorMessage);
    return { error: errorMessage };
  }
}
